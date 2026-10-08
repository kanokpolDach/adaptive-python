from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import ast
import os
import sys
import tempfile
import subprocess
import secrets
import string
import threading
import traceback


# =========================================================
# FLASK SERVER
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}}
)

# =========================================================
# SOCKET.IO
# =========================================================

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    ping_timeout=60,
    ping_interval=25,
    logger=False,
    engineio_logger=False,
)

rooms = {}
rooms_lock = threading.Lock()


# =========================================================
# ROOM HELPERS
# =========================================================

def generate_room_code(length=6):
    characters = string.ascii_uppercase + string.digits

    while True:
        code = "".join(
            secrets.choice(characters)
            for _ in range(length)
        )

        if code not in rooms:
            return code


def get_room_state(room_code):
    room = rooms.get(room_code)

    if not room:
        return None

    players = []

    for player in room["players"].values():
        players.append({
            "id": player["id"],
            "socketId": player["id"],
            "name": player["name"],
            "x": player["x"],
            "y": player["y"],
            "z": player["z"],
            "rotation": player["rotation"],
            "score": player["score"],
            "ready": bool(player["ready"]),
        })

    return {
        "roomCode": room_code,
        "ownerId": room.get("owner_id"),
        "hostId": room.get("owner_id"),
        "players": players,
        "status": room["status"],
    }


def emit_room_state(room_code, event="game_state"):
    """ส่ง state แบบทั้ง flat และ nested เพื่อรองรับ Frontend หลายรูปแบบ"""
    state = get_room_state(room_code)

    if not state:
        return

    payload = {
        **state,
        "state": state,
    }

    socketio.emit(event, payload, to=room_code)


def room_state_payload(room_code):
    state = get_room_state(room_code)
    if not state:
        return None

    return {
        **state,
        "state": state,
    }


# =========================================================
# ERROR ANALYZER
# =========================================================

def analyze_error(error_text, code):
    lines = code.splitlines()

    error_info = {
        "type": "Python Error",
        "message": error_text.strip(),
        "line": None,
        "code": None,
        "suggestion": "ตรวจสอบโค้ดและข้อความ Error แล้วลองแก้ไขอีกครั้ง",
    }

    try:
        ast.parse(code)

    except SyntaxError as e:
        error_type = type(e).__name__

        error_info["type"] = error_type
        error_info["message"] = e.msg

        if e.lineno:
            error_info["line"] = e.lineno

            if 1 <= e.lineno <= len(lines):
                error_info["code"] = lines[e.lineno - 1]

        if error_type == "IndentationError":
            error_info["suggestion"] = (
                "ตรวจสอบการเยื้องบรรทัด (Indentation) "
                "ให้สม่ำเสมอ โดย Python แนะนำให้ใช้ Space 4 ช่อง"
            )

        elif error_type == "TabError":
            error_info["suggestion"] = (
                "อย่าใช้ Tab และ Space ปะปนกัน "
                "แนะนำให้ใช้ Space จำนวน 4 ช่อง"
            )

        else:
            error_info["suggestion"] = (
                "ตรวจสอบเครื่องหมาย เช่น :, (), [], {}, "
                "เครื่องหมายคำพูด และโครงสร้างคำสั่ง Python"
            )

        return error_info

    error_lines = error_text.strip().splitlines()

    for line in reversed(error_lines):
        if 'File "' in line and ", line " in line:
            try:
                line_number = int(
                    line.split(", line ")[1].split(",")[0]
                )

                error_info["line"] = line_number

                if 1 <= line_number <= len(lines):
                    error_info["code"] = lines[line_number - 1]

                break

            except (ValueError, IndexError):
                pass

    error_types = [
        "NameError",
        "TypeError",
        "ValueError",
        "IndexError",
        "KeyError",
        "ZeroDivisionError",
        "AttributeError",
        "ModuleNotFoundError",
        "FileNotFoundError",
        "ImportError",
        "OverflowError",
        "RuntimeError",
        "AssertionError",
        "RecursionError",
    ]

    detected_type = None

    for error_type in error_types:
        if error_type in error_text:
            detected_type = error_type
            break

    if detected_type:
        error_info["type"] = detected_type

    suggestions = {
        "NameError":
            "ตรวจสอบว่าชื่อตัวแปรหรือฟังก์ชันสะกดถูกต้อง "
            "และมีการประกาศก่อนนำไปใช้งาน",

        "TypeError":
            "ตรวจสอบชนิดข้อมูลของตัวแปร "
            "เช่น การนำ String ไปคำนวณกับตัวเลข",

        "ValueError":
            "ตรวจสอบค่าของข้อมูลว่ามีรูปแบบที่คำสั่งนั้นรองรับหรือไม่",

        "IndexError":
            "ตรวจสอบตำแหน่ง Index ของ List หรือ Tuple "
            "ว่าอยู่ในช่วงข้อมูลหรือไม่",

        "KeyError":
            "ตรวจสอบชื่อ Key ใน Dictionary "
            "ว่ามี Key ที่ต้องการอยู่จริงหรือไม่",

        "ZeroDivisionError":
            "ไม่สามารถหารด้วย 0 ได้ "
            "ตรวจสอบค่าตัวหารก่อนคำนวณ",

        "AttributeError":
            "ตรวจสอบว่า Object นั้นมี Attribute หรือ Method "
            "ที่กำลังเรียกใช้งานหรือไม่",

        "ModuleNotFoundError":
            "ไม่พบ Module ที่ต้องการใช้งาน "
            "ตรวจสอบชื่อ Module หรือการติดตั้ง Package",

        "FileNotFoundError":
            "ไม่พบไฟล์หรือโฟลเดอร์ที่ระบุ "
            "ตรวจสอบชื่อและตำแหน่งไฟล์",

        "ImportError":
            "ตรวจสอบคำสั่ง import "
            "และชื่อสิ่งที่ต้องการนำเข้า",

        "OverflowError":
            "ค่าที่คำนวณมีขนาดใหญ่เกินไป "
            "ลองตรวจสอบค่าที่ใช้ในการคำนวณ",

        "AssertionError":
            "เงื่อนไขที่ใช้ใน assert ไม่เป็นจริง",

        "RecursionError":
            "ฟังก์ชันเรียกตัวเองมากเกินไป "
            "ตรวจสอบเงื่อนไขการหยุดของ Recursion",
    }

    if detected_type in suggestions:
        error_info["suggestion"] = suggestions[detected_type]

    return error_info


# =========================================================
# RUN PYTHON
# =========================================================

def execute_python(code):
    temp_file = None

    try:
        try:
            ast.parse(code)

        except SyntaxError:
            error_info = analyze_error(
                traceback.format_exc(),
                code
            )

            return {
                "success": False,
                "output": "",
                "error": "Syntax Error",
                "error_info": error_info,
            }

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write(code)
            temp_file = f.name

        result = subprocess.run(
            [
                sys.executable,
                temp_file,
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )

        output = result.stdout
        error = result.stderr

        if result.returncode == 0:
            return {
                "success": True,
                "output": output,
                "error": None,
                "error_info": None,
            }

        error_info = analyze_error(error, code)

        return {
            "success": False,
            "output": output,
            "error": error,
            "error_info": error_info,
        }

    except subprocess.TimeoutExpired:
        error_info = {
            "type": "TimeoutError",
            "message": "โปรแกรมใช้เวลาทำงานนานเกินกำหนด",
            "line": None,
            "code": None,
            "suggestion": (
                "ตรวจสอบ Infinite Loop เช่น "
                "while ที่ไม่มีเงื่อนไขหยุด"
            ),
        }

        return {
            "success": False,
            "output": "",
            "error": "Program Timeout",
            "error_info": error_info,
        }

    except Exception as e:
        error_info = {
            "type": type(e).__name__,
            "message": str(e),
            "line": None,
            "code": None,
            "suggestion": "ตรวจสอบ Server และลองใหม่อีกครั้ง",
        }

        return {
            "success": False,
            "output": "",
            "error": str(e),
            "error_info": error_info,
        }

    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except OSError:
                pass


# =========================================================
# PRACTICE CHECKERS
# =========================================================

def check_exercise_1(tree):
    has_name = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "name":
                    has_name = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_name and has_print


def check_exercise_2(tree):
    has_age = False
    has_name = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    if target.id == "age":
                        has_age = True
                    if target.id == "name":
                        has_name = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_age and has_name and has_print


def check_exercise_3(tree):
    has_a = False
    has_b = False
    has_addition = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    if target.id == "a":
                        has_a = True
                    if target.id == "b":
                        has_b = True

        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            has_addition = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_a and has_b and has_addition and has_print


def check_exercise_4(tree):
    has_first_name = False
    has_last_name = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    if target.id == "first_name":
                        has_first_name = True
                    if target.id == "last_name":
                        has_last_name = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_first_name and has_last_name and has_print


def check_exercise_5(tree):
    has_fruits = False
    has_list = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "fruits":
                    has_fruits = True

            if isinstance(node.value, ast.List):
                has_list = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_fruits and has_list and has_print


def check_exercise_6(tree):
    has_numbers = False
    has_tuple = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "numbers":
                    has_numbers = True

            if isinstance(node.value, ast.Tuple):
                has_tuple = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_numbers and has_tuple and has_print


def check_exercise_7(tree):
    has_if = False
    has_comparison = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.If):
            has_if = True

        if isinstance(node, ast.Compare):
            has_comparison = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_if and has_comparison and has_print


def check_exercise_8(tree):
    has_for = False
    has_range = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.For):
            has_for = True

        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id == "range":
                has_range = True

            if node.func.id == "print":
                has_print = True

    return has_for and has_range and has_print


def check_exercise_9(tree):
    has_while = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.While):
            has_while = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_while and has_print


def check_exercise_10(tree):
    has_function = False
    has_print = False

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            has_function = True

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "print":
                has_print = True

    return has_function and has_print


def validate_exercise(code, exercise):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return False

    checkers = {
        1: check_exercise_1,
        2: check_exercise_2,
        3: check_exercise_3,
        4: check_exercise_4,
        5: check_exercise_5,
        6: check_exercise_6,
        7: check_exercise_7,
        8: check_exercise_8,
        9: check_exercise_9,
        10: check_exercise_10,
    }

    checker = checkers.get(exercise)

    if not checker:
        return False

    return checker(tree)


# =========================================================
# FOOTBALL QUESTIONS
# =========================================================

FOOTBALL_QUESTIONS = [
    {
        "id": 1,
        "title": "สร้างตัวแปรและแสดงค่า",
        "prompt": "สร้างตัวแปร name ให้มีค่าเป็น Python แล้วแสดงค่าด้วย print()",
        "hint": 'name = "Python"',
        "expected": "Python",
    },
    {
        "id": 2,
        "title": "บวกตัวเลข",
        "prompt": "กำหนด a = 10 และ b = 5 แล้วแสดงผล a + b",
        "hint": "a = 10\nb = 5",
        "expected": "15",
    },
    {
        "id": 3,
        "title": "คำนวณคะแนน",
        "prompt": "กำหนด score = 20 แล้วเพิ่มอีก 10 และแสดงผล",
        "hint": "score = 20\nscore += 10",
        "expected": "30",
    },
    {
        "id": 4,
        "title": "เงื่อนไข if",
        "prompt": "กำหนด age = 18 ถ้า age >= 18 ให้แสดงคำว่า Adult",
        "hint": "if age >= 18:",
        "expected": "Adult",
    },
    {
        "id": 5,
        "title": "วนซ้ำ for",
        "prompt": "ใช้ for แสดงตัวเลข 1 ถึง 3 คนละบรรทัด",
        "hint": "for i in range(1, 4):",
        "expected": "1\n2\n3",
    },
    {
        "id": 6,
        "title": "List",
        "prompt": "สร้าง fruits = ['apple', 'banana'] แล้วแสดง fruits[0]",
        "hint": "print(fruits[0])",
        "expected": "apple",
    },
    {
        "id": 7,
        "title": "ฟังก์ชัน",
        "prompt": "สร้างฟังก์ชัน greet() ที่แสดงคำว่า Hello แล้วเรียกใช้ฟังก์ชัน",
        "hint": "def greet():",
        "expected": "Hello",
    },
    {
        "id": 8,
        "title": "คูณตัวเลข",
        "prompt": "กำหนด x = 6 และ y = 7 แล้วแสดงผล x * y",
        "hint": "x = 6\ny = 7",
        "expected": "42",
    },
]


def normalize_output(value):
    return "\n".join(
        line.strip()
        for line in str(value or "").strip().splitlines()
    ).strip()


# =========================================================
# FOOTBALL GAME STATE
# =========================================================

def make_game_state(room_code, room, sid=None):
    game = room.get("game")

    base = {
        "roomCode": room_code,
        "phase": "waiting",
        "round": 1,
        "maxRounds": 2,
        "attempt": 0,
        "maxAttempts": 4,
        "shooterId": None,
        "keeperId": None,
        "scores": {
            player_id: player["score"]
            for player_id, player in room["players"].items()
        },
        "question": None,
        "answerReady": False,
        "answerReadyByPlayer": {},
        "keeperX": 0,
        "aimX": 0,
        "lastResult": None,
        "winnerId": None,
        "winnerName": None,
        "players": [
            {
                "id": p["id"],
                "socketId": p["id"],
                "name": p["name"],
            }
            for p in room["players"].values()
        ],
    }

    if not game:
        return base

    question = None

    if game.get("question_index") is not None:
        question = FOOTBALL_QUESTIONS[
            game["question_index"]
        ]

    answer_ready = game.get("answer_ready", {})

    return {
        **base,
        "phase": game["phase"],
        "round": game["round"],
        "maxRounds": game["max_rounds"],
        "attempt": game["attempt"],
        "maxAttempts": game["max_attempts"],
        "shooterId": game.get("shooter_id"),
        "keeperId": game.get("keeper_id"),
        "question": question,
        "answerReady": bool(
            answer_ready.get(sid, False)
        ),
        "answerReadyByPlayer": dict(answer_ready),
        "keeperX": game.get("keeper_x", 0),
        "aimX": game.get("aim_x", 0),
        "lastResult": game.get("last_result"),
        "winnerId": game.get("winner_id"),
        "winnerName": game.get("winner_name"),
    }


def init_football_game(room_code, room):
    player_ids = list(room["players"].keys())

    if len(player_ids) < 2:
        return False

    for player in room["players"].values():
        player["score"] = 0

    room["game"] = {
        "phase": "playing",
        "round": 1,
        "max_rounds": 2,
        "attempt": 0,
        "max_attempts": 4,
        "shooter_id": player_ids[0],
        "keeper_id": player_ids[1],
        "question_index": 0,
        "answer_ready": {
            player_id: False
            for player_id in player_ids
        },
        "keeper_x": 0,
        "aim_x": 0,
        "last_result": None,
        "winner_id": None,
        "winner_name": None,
    }

    room["status"] = "playing"

    return True


def broadcast_football_state(room_code):
    room = rooms.get(room_code)

    if not room:
        return

    state = make_game_state(
        room_code,
        room
    )

    socketio.emit(
        "football_game_state",
        {
            "state": state,
            **state,
        },
        to=room_code,
    )


# =========================================================
# SOCKET CONNECT
# =========================================================

@socketio.on("connect")
def handle_connect():
    print(
        f"🔌 Socket connected: {request.sid}"
    )


# =========================================================
# CREATE ROOM
# =========================================================

@socketio.on("create_room")
def handle_create_room(data=None):
    data = data or {}

    player_name = (
        str(data.get("name", "Player 1")).strip()
        or "Player 1"
    )

    with rooms_lock:
        room_code = generate_room_code()

        player = {
            "id": request.sid,
            "name": player_name,
            "x": 0,
            "y": 0,
            "z": 5,
            "rotation": 0,
            "score": 0,
            "ready": False,
        }

        rooms[room_code] = {
            "owner_id": request.sid,
            "players": {
                request.sid: player
            },
            "status": "waiting",
            "game": None,
        }

        payload = room_state_payload(
            room_code
        )

    join_room(room_code)

    emit(
        "room_created",
        {
            "success": True,
            "roomCode": room_code,
            "playerId": request.sid,
            "ownerId": request.sid,
            "hostId": request.sid,
            **payload,
        },
        to=request.sid,
    )

    print(
        f"🎮 Room created: {room_code} "
        f"by {player_name} ({request.sid})"
    )


# =========================================================
# JOIN ROOM
# =========================================================

@socketio.on("join_room")
def handle_join_room(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    player_name = (
        str(data.get("name", "Player 2")).strip()
        or "Player 2"
    )

    player_id = request.sid

    if not room_code:
        emit(
            "room_error",
            {
                "message": "กรุณาระบุ Room Code"
            },
            to=player_id,
        )
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if room is None:
            emit(
                "room_error",
                {
                    "message":
                    "ไม่พบห้องนี้ หรือ Room Code ไม่ถูกต้อง"
                },
                to=player_id,
            )
            return

        if player_id in room["players"]:
            payload = room_state_payload(
                room_code
            )

            emit(
                "room_joined",
                {
                    "success": True,
                    "roomCode": room_code,
                    "playerId": player_id,
                    **payload,
                },
                to=player_id,
            )
            return

        if len(room["players"]) >= 2:
            emit(
                "room_error",
                {
                    "message":
                    "ห้องนี้มีผู้เล่นครบแล้ว"
                },
                to=player_id,
            )
            return

        if room["status"] == "playing":
            emit(
                "room_error",
                {
                    "message":
                    "เกมเริ่มแล้ว ไม่สามารถเข้าห้องได้"
                },
                to=player_id,
            )
            return

        room["players"][player_id] = {
            "id": player_id,
            "name": player_name,
            "x": 3,
            "y": 0,
            "z": 5,
            "rotation": 0,
            "score": 0,
            "ready": False,
        }

        payload = room_state_payload(
            room_code
        )

    join_room(room_code)

    emit(
        "room_joined",
        {
            "success": True,
            "roomCode": room_code,
            "playerId": player_id,
            **payload,
        },
        to=player_id,
    )

    socketio.emit(
        "player_joined",
        payload,
        to=room_code,
    )

    # ส่งสถานะให้ทุกคนอีกครั้ง
    socketio.emit(
        "players_update",
        payload,
        to=room_code,
    )

    print(
        f"👤 {player_name} joined room "
        f"{room_code} ({player_id})"
    )


# =========================================================
# PLAYER READY
# =========================================================

@socketio.on("player_ready")
def handle_player_ready(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    if not room_code:
        emit(
            "room_error",
            {
                "message":
                "ไม่พบ Room Code"
            },
            to=request.sid,
        )
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            emit(
                "room_error",
                {
                    "message":
                    "ไม่พบห้อง"
                },
                to=request.sid,
            )
            return

        player = room["players"].get(
            request.sid
        )

        if not player:
            emit(
                "room_error",
                {
                    "message":
                    "ไม่พบผู้เล่นในห้อง"
                },
                to=request.sid,
            )
            return

        # ถ้า Frontend ส่ง ready มา ให้ใช้ค่าที่ส่ง
        # ถ้าไม่ส่ง ให้ toggle
        if "ready" in data:
            player["ready"] = bool(
                data["ready"]
            )
        else:
            player["ready"] = not bool(
                player.get("ready", False)
            )

        all_ready = (
            len(room["players"]) == 2
            and all(
                p["ready"]
                for p in room["players"].values()
            )
        )

        room["status"] = (
            "ready"
            if all_ready
            else "waiting"
        )

        payload = room_state_payload(
            room_code
        )

    socketio.emit(
        "game_state",
        payload,
        to=room_code,
    )

    socketio.emit(
        "players_update",
        payload,
        to=room_code,
    )

    print(
        f"✅ READY update: {request.sid} "
        f"in {room_code}"
    )


# =========================================================
# START GAME
# =========================================================

@socketio.on("start_game")
def handle_start_game(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    if not room_code:
        emit(
            "start_game_result",
            {
                "success": False,
                "message":
                "ไม่พบ Room Code",
            },
            to=request.sid,
        )
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            emit(
                "start_game_result",
                {
                    "success": False,
                    "message":
                    "ไม่พบห้อง",
                },
                to=request.sid,
            )
            return

        # =================================================
        # ตรวจสอบ HOST
        # =================================================

        if room.get("owner_id") != request.sid:
            emit(
                "start_game_result",
                {
                    "success": False,
                    "message":
                    "เฉพาะคนสร้างห้องเท่านั้นที่เริ่มเกมได้",
                    "roomCode": room_code,
                },
                to=request.sid,
            )
            return

        # =================================================
        # ผู้เล่นต้องครบ 2 คน
        # =================================================

        if len(room["players"]) != 2:
            emit(
                "start_game_result",
                {
                    "success": False,
                    "message":
                    "ต้องมีผู้เล่นครบ 2 คนก่อนเริ่มเกม",
                    "roomCode": room_code,
                },
                to=request.sid,
            )
            return

        # =================================================
        # READY ครบ
        # =================================================

        if not all(
            p.get("ready", False)
            for p in room["players"].values()
        ):
            emit(
                "start_game_result",
                {
                    "success": False,
                    "message":
                    "ผู้เล่นทั้ง 2 คนต้องกด READY ก่อน",
                    "roomCode": room_code,
                },
                to=request.sid,
            )
            return

        # =================================================
        # ป้องกันกดซ้ำ
        # =================================================

        if room.get("status") == "playing":
            payload = room_state_payload(
                room_code
            )

            emit(
                "start_game_result",
                {
                    "success": True,
                    "message":
                    "เกมเริ่มแล้ว",
                    "roomCode": room_code,
                    **payload,
                },
                to=request.sid,
            )
            return

        # =================================================
        # เริ่มเกม
        # =================================================

        init_football_game(
            room_code,
            room
        )

        room["status"] = "playing"

        room_state = room_state_payload(
            room_code
        )

        football_state = make_game_state(
            room_code,
            room,
            request.sid,
        )

    # =====================================================
    # ส่งผลกลับทุกคน
    # =====================================================

    socketio.emit(
        "game_state",
        room_state,
        to=room_code,
    )

    socketio.emit(
        "start_game_result",
        {
            "success": True,
            "message":
            "🔥 เริ่มการแข่งขันแล้ว!",
            "roomCode": room_code,
            "ownerId":
            room_state["ownerId"],
            "players":
            room_state["players"],
            "status":
            "playing",
            "state":
            room_state,
        },
        to=room_code,
    )

    # Event เพิ่มเพื่อรองรับ Frontend
    socketio.emit(
        "game_started",
        {
            "success": True,
            "roomCode": room_code,
            "status": "playing",
            "state": football_state,
        },
        to=room_code,
    )

    socketio.emit(
        "football_game_state",
        {
            "success": True,
            "roomCode": room_code,
            "state": football_state,
            **football_state,
        },
        to=room_code,
    )

    print(
        f"🚀 GAME STARTED: {room_code} "
        f"by owner {request.sid}"
    )


# =========================================================
# FOOTBALL GET STATE
# =========================================================

@socketio.on("football_get_state")
def handle_football_get_state(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    if not room_code:
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            emit(
                "football_error",
                {
                    "message":
                    "ไม่พบห้อง"
                },
                to=request.sid,
            )
            return

        state = make_game_state(
            room_code,
            room,
            request.sid,
        )

    emit(
        "football_game_state",
        {
            "state": state,
            **state,
        },
        to=request.sid,
    )


# =========================================================
# FOOTBALL MOVE KEEPER
# =========================================================

@socketio.on("football_move_keeper")
def handle_football_move_keeper(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    try:
        x = float(
            data.get("x", 0)
        )
    except (TypeError, ValueError):
        x = 0

    x = max(-3.0, min(3.0, x))

    with rooms_lock:
        room = rooms.get(room_code)

        if not room or not room.get("game"):
            return

        game = room["game"]

        if (
            game["phase"] not in
            ("playing", "sudden_death")
            or
            game["keeper_id"] != request.sid
        ):
            return

        game["keeper_x"] = x

    socketio.emit(
        "football_keeper_moved",
        {
            "playerId": request.sid,
            "x": x,
        },
        to=room_code,
        include_self=False,
    )


# =========================================================
# FOOTBALL AIM
# =========================================================

@socketio.on("football_aim")
def handle_football_aim(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    try:
        x = float(
            data.get("x", 0)
        )
    except (TypeError, ValueError):
        x = 0

    x = max(-3.0, min(3.0, x))

    with rooms_lock:
        room = rooms.get(room_code)

        if not room or not room.get("game"):
            return

        game = room["game"]

        if (
            game["phase"] not in
            ("playing", "sudden_death")
            or
            game["shooter_id"] != request.sid
        ):
            return

        game["aim_x"] = x

    socketio.emit(
        "football_aim_changed",
        {
            "playerId": request.sid,
            "x": x,
        },
        to=room_code,
    )


# =========================================================
# FOOTBALL ANSWER
# =========================================================

@socketio.on("football_answer")
def handle_football_answer(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    code = data.get("code", "")

    if not isinstance(code, str) or not code.strip():
        emit(
            "football_answer_result",
            {
                "correct": False,
                "message":
                "กรุณาเขียน Python ก่อนตรวจคำตอบ",
            },
            to=request.sid,
        )
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room or not room.get("game"):
            return

        game = room["game"]

        if game["phase"] not in (
            "playing",
            "sudden_death",
        ):
            return

        if game["shooter_id"] != request.sid:
            emit(
                "football_answer_result",
                {
                    "correct": False,
                    "message":
                    "ตอนนี้คุณไม่ได้เป็นคนยิง",
                },
                to=request.sid,
            )
            return

        question = FOOTBALL_QUESTIONS[
            game["question_index"]
        ]

    result = execute_python(code)

    correct = (
        result["success"]
        and normalize_output(
            result.get("output")
        )
        ==
        normalize_output(
            question["expected"]
        )
    )

    with rooms_lock:
        room = rooms.get(room_code)

        if not room or not room.get("game"):
            return

        game = room["game"]

        if correct:
            game["answer_ready"][
                request.sid
            ] = True

    emit(
        "football_answer_result",
        {
            "correct": correct,
            "output":
            result.get("output", ""),
            "error":
            result.get("error"),
            "errorInfo":
            result.get("error_info"),
            "message":
            (
                "✅ ตอบถูก! ยิงได้เลย"
                if correct
                else
                "❌ ยังไม่ถูก ลองแก้ Python แล้วตอบใหม่"
            ),
        },
        to=request.sid,
    )

    if correct:
        broadcast_football_state(
            room_code
        )


# =========================================================
# FOOTBALL SHOOT
# =========================================================

@socketio.on("football_shoot")
def handle_football_shoot(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    try:
        aim_x = float(
            data.get("x", 0)
        )
    except (TypeError, ValueError):
        aim_x = 0

    aim_x = max(
        -3.0,
        min(3.0, aim_x)
    )

    with rooms_lock:
        room = rooms.get(room_code)

        if not room or not room.get("game"):
            return

        game = room["game"]

        if game["phase"] not in (
            "playing",
            "sudden_death",
        ):
            return

        if game["shooter_id"] != request.sid:
            emit(
                "football_error",
                {
                    "message":
                    "ตอนนี้คุณไม่ได้เป็นคนยิง"
                },
                to=request.sid,
            )
            return

        if not game["answer_ready"].get(
            request.sid,
            False,
        ):
            emit(
                "football_error",
                {
                    "message":
                    "ต้องตอบ Python ให้ถูกก่อนยิง"
                },
                to=request.sid,
            )
            return

        keeper_x = float(
            game.get("keeper_x", 0)
        )

        game["aim_x"] = aim_x

        saved = (
            abs(aim_x - keeper_x)
            <= 0.9
        )

        shooter_id = game["shooter_id"]
        shooter = room["players"].get(
            shooter_id
        )

        game["answer_ready"][
            shooter_id
        ] = False

        game["attempt"] += 1

        if saved:
            result = "save"

            message = (
                "🧤 เซฟได้! "
                "ผู้รักษาประตูป้องกันไว้ได้"
            )

        else:
            result = "goal"

            shooter["score"] += 1

            message = (
                "⚽ GOAL! ยิงเข้า! +1 คะแนน"
            )

        game["last_result"] = {
            "type": result,
            "message": message,
            "shooterId": shooter_id,
            "keeperId": game["keeper_id"],
            "aimX": aim_x,
            "keeperX": keeper_x,
            "attempt": game["attempt"],
            "round": game["round"],
        }

        winner_id = None

        if shooter["score"] >= 4:
            winner_id = shooter_id

            game["phase"] = "finished"
            game["winner_id"] = shooter_id
            game["winner_name"] = shooter["name"]

            room["status"] = "finished"

        elif game["attempt"] >= game["max_attempts"]:

            if game["round"] == 1:
                player_ids = list(
                    room["players"].keys()
                )

                game["round"] = 2
                game["attempt"] = 0
                game["shooter_id"] = player_ids[1]
                game["keeper_id"] = player_ids[0]
                game["question_index"] = 4
                game["keeper_x"] = 0
                game["aim_x"] = 0

                game["last_result"] = {
                    **game["last_result"],
                    "roundComplete": True,
                    "nextRound": 2,
                }

                for player_id in game[
                    "answer_ready"
                ]:
                    game["answer_ready"][
                        player_id
                    ] = False

            else:
                scores = {
                    pid: p["score"]
                    for pid, p
                    in room["players"].items()
                }

                sorted_players = sorted(
                    scores.items(),
                    key=lambda item:
                    item[1],
                    reverse=True,
                )

                if (
                    len(sorted_players) >= 2
                    and
                    sorted_players[0][1]
                    !=
                    sorted_players[1][1]
                ):
                    winner_id = (
                        sorted_players[0][0]
                    )

                    game["phase"] = "finished"
                    game["winner_id"] = winner_id
                    game["winner_name"] = (
                        room["players"][
                            winner_id
                        ]["name"]
                    )

                    room["status"] = "finished"

                else:
                    game["phase"] = "sudden_death"
                    game["round"] = 3
                    game["attempt"] = 0
                    game["max_attempts"] = 1

                    player_ids = list(
                        room["players"].keys()
                    )

                    game["shooter_id"] = player_ids[0]
                    game["keeper_id"] = player_ids[1]
                    game["question_index"] = 0
                    game["keeper_x"] = 0
                    game["aim_x"] = 0

                    for player_id in game[
                        "answer_ready"
                    ]:
                        game["answer_ready"][
                            player_id
                        ] = False

        if game["phase"] in (
            "playing",
            "sudden_death",
        ):
            if game["round"] == 1:
                game["question_index"] = (
                    game["attempt"] % 4
                )

            elif game["round"] == 2:
                game["question_index"] = (
                    4 +
                    (game["attempt"] % 4)
                )

            else:
                game["question_index"] = (
                    game["attempt"]
                    % len(FOOTBALL_QUESTIONS)
                )

        state = make_game_state(
            room_code,
            room,
        )

        event = dict(
            game["last_result"]
        )

        event["scores"] = state["scores"]
        event["winnerId"] = (
            winner_id
            or game.get("winner_id")
        )
        event["phase"] = game["phase"]
        event["round"] = game["round"]

    socketio.emit(
        "football_shot_result",
        {
            "result": event,
            "state": state,
        },
        to=room_code,
    )


# =========================================================
# PLAYER MOVE
# =========================================================

@socketio.on("player_move")
def handle_player_move(data=None):
    data = data or {}

    room_code = data.get(
        "roomCode"
    )

    if not room_code:
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            return

        player = room["players"].get(
            request.sid
        )

        if not player:
            return

        player["x"] = data.get(
            "x",
            player["x"],
        )

        player["y"] = data.get(
            "y",
            player["y"],
        )

        player["z"] = data.get(
            "z",
            player["z"],
        )

        player["rotation"] = data.get(
            "rotation",
            player["rotation"],
        )

        movement = {
            "playerId": request.sid,
            "x": player["x"],
            "y": player["y"],
            "z": player["z"],
            "rotation": player["rotation"],
        }

    emit(
        "player_moved",
        movement,
        to=room_code,
        include_self=False,
    )


# =========================================================
# PLAYER SCORE
# =========================================================

@socketio.on("player_score")
def handle_player_score(data=None):
    data = data or {}

    room_code = data.get(
        "roomCode"
    )

    if not room_code:
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            return

        player = room["players"].get(
            request.sid
        )

        if not player:
            return

        try:
            points = int(
                data.get("points", 1)
            )
        except (TypeError, ValueError):
            points = 1

        player["score"] += points

        state = get_room_state(
            room_code
        )

        score = player["score"]

    socketio.emit(
        "score_updated",
        {
            "playerId": request.sid,
            "score": score,
            "state": state,
            **state,
        },
        to=room_code,
    )


# =========================================================
# GAME EVENT
# =========================================================

@socketio.on("game_event")
def handle_game_event(data=None):
    data = data or {}

    room_code = data.get(
        "roomCode"
    )

    if not room_code:
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            return

    emit(
        "game_event",
        {
            "playerId": request.sid,
            "event": data.get("event"),
            "data": data.get(
                "data",
                {},
            ),
        },
        to=room_code,
        include_self=False,
    )


# =========================================================
# LEAVE ROOM
# =========================================================

@socketio.on("leave_room")
def handle_leave_room(data=None):
    data = data or {}

    room_code = (
        str(data.get("roomCode", ""))
        .strip()
        .upper()
    )

    if not room_code:
        return

    remove_player_from_room(
        request.sid,
        room_code,
        "leave_room",
    )


# =========================================================
# REMOVE PLAYER
# =========================================================

def remove_player_from_room(
    player_id,
    room_code,
    reason="disconnect",
):
    should_broadcast = False

    with rooms_lock:
        room = rooms.get(room_code)

        if not room:
            return

        if player_id not in room["players"]:
            return

        del room["players"][player_id]

        if len(room["players"]) == 0:
            del rooms[room_code]
            should_broadcast = False

        else:
            # =========================================
            # ถ้า HOST ออก ให้ผู้เล่นที่เหลือเป็น HOST
            # =========================================

            if room.get("owner_id") == player_id:
                remaining_ids = list(
                    room["players"].keys()
                )

                if remaining_ids:
                    room["owner_id"] = (
                        remaining_ids[0]
                    )

            # =========================================
            # Reset game
            # =========================================

            room["status"] = "waiting"
            room["game"] = None

            for player in room["players"].values():
                player["ready"] = False

            should_broadcast = True

            payload = room_state_payload(
                room_code
            )

    if should_broadcast:
        socketio.emit(
            "player_left",
            {
                "playerId": player_id,
                **payload,
            },
            to=room_code,
        )

        socketio.emit(
            "players_update",
            payload,
            to=room_code,
        )

        print(
            f"👋 Player {player_id} "
            f"left room {room_code} "
            f"({reason})"
        )


# =========================================================
# DISCONNECT
# =========================================================

@socketio.on("disconnect")
def handle_disconnect():
    room_codes = []

    with rooms_lock:
        for room_code, room in rooms.items():
            if request.sid in room["players"]:
                room_codes.append(
                    room_code
                )

    for room_code in room_codes:
        remove_player_from_room(
            request.sid,
            room_code,
            "disconnect",
        )


# =========================================================
# RUN PYTHON
# =========================================================

@app.route(
    "/run-python",
    methods=["POST"]
)
def run_python():
    data = request.get_json(
        silent=True
    )

    if not data:
        return jsonify({
            "success": False,
            "error": "ไม่พบข้อมูล",
            "error_info": None,
        }), 400

    code = data.get(
        "code",
        ""
    )

    if not isinstance(code, str):
        return jsonify({
            "success": False,
            "error":
            "code ต้องเป็นข้อความ",
            "error_info": None,
        }), 400

    if not code.strip():
        return jsonify({
            "success": False,
            "error":
            "กรุณาเขียน Python ก่อน Run",
            "error_info": None,
        }), 400

    result = execute_python(
        code
    )

    return jsonify(result), (
        200
        if result["success"]
        else 400
    )


# =========================================================
# CHECK EXERCISE
# =========================================================

@app.route(
    "/check-exercise",
    methods=["POST"]
)
def check_exercise():
    data = request.get_json(
        silent=True
    )

    if not data:
        return jsonify({
            "success": False,
            "error": "ไม่พบข้อมูล",
        }), 400

    code = data.get(
        "code",
        ""
    )

    exercise = data.get(
        "exercise"
    )

    if not isinstance(code, str):
        return jsonify({
            "success": False,
            "error":
            "code ต้องเป็นข้อความ",
        }), 400

    try:
        exercise = int(
            exercise
        )

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "error":
            "exercise ต้องเป็นตัวเลข",
        }), 400

    if exercise < 1 or exercise > 10:
        return jsonify({
            "success": False,
            "error":
            "ไม่พบแบบฝึกหัดนี้",
        }), 400

    if not code.strip():
        return jsonify({
            "success": False,
            "error":
            "กรุณาเขียนโค้ดก่อนตรวจคำตอบ",
        }), 400

    result = execute_python(
        code
    )

    if not result["success"]:
        return jsonify({
            "success": False,
            "output":
            result["output"],
            "error":
            result["error"],
            "correct": False,
            "exercise": exercise,
            "error_info":
            result["error_info"],
        }), 400

    correct = validate_exercise(
        code,
        exercise
    )

    return jsonify({
        "success": True,
        "output":
        result["output"],
        "error": None,
        "correct": correct,
        "exercise": exercise,
        "error_info": None,
    }), 200


# =========================================================
# SOCKET STATUS
# =========================================================

@app.route(
    "/socket-status",
    methods=["GET"]
)
def socket_status():
    with rooms_lock:
        return jsonify({
            "status": "online",
            "socketio": True,
            "rooms": len(rooms),
            "players": sum(
                len(room["players"])
                for room in rooms.values()
            ),
        })


# =========================================================
# HOME
# =========================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():
    return jsonify({
        "message":
        "Adaptive Python Server is running",
        "status": "online",
        "endpoints": [
            "/run-python",
            "/check-exercise",
            "/socket-status",
            "Socket.IO Multiplayer",
        ],
    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    port = int(
        os.environ.get(
            "PORT",
            5000,
        )
    )

    print("=" * 60)
    print("🐍 Adaptive Python Server")
    print("=" * 60)
    print(
        f"Server running on port {port}"
    )
    print(
        "Playground: POST /run-python"
    )
    print(
        "Practice:   POST /check-exercise"
    )
    print(
        "Multiplayer: Socket.IO"
    )
    print("=" * 60)

    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=False,
        allow_unsafe_werkzeug=True,
    )
