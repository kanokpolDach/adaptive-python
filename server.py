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
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)

# =========================================================
# SOCKET.IO MULTIPLAYER
# =========================================================

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    ping_timeout=60,
    ping_interval=25,
    logger=False,
    engineio_logger=False
)

# เก็บข้อมูลห้อง Multiplayer
rooms = {}

# ป้องกันข้อมูลห้องชนกัน
rooms_lock = threading.Lock()


def generate_room_code(length=6):
    """สร้าง Room Code เช่น AB12CD"""

    characters = string.ascii_uppercase + string.digits

    while True:
        code = "".join(
            secrets.choice(characters)
            for _ in range(length)
        )

        if code not in rooms:
            return code


def get_room_state(room_code):
    """สร้างข้อมูลสถานะห้องสำหรับส่งให้ Frontend"""

    room = rooms.get(room_code)

    if not room:
        return None

    players = []

    for player in room["players"].values():

        players.append({
            "id": player["id"],
            "name": player["name"],
            "x": player["x"],
            "y": player["y"],
            "z": player["z"],
            "rotation": player["rotation"],
            "score": player["score"],
            "ready": player["ready"]
        })

    return {
        "roomCode": room_code,
        "players": players,
        "status": room["status"]
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
        "suggestion": "ตรวจสอบโค้ดและข้อความ Error แล้วลองแก้ไขอีกครั้ง"
    }

    # =====================================================
    # SYNTAX ERROR
    # =====================================================

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

    # =====================================================
    # RUNTIME ERROR
    # =====================================================

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

    # =====================================================
    # ERROR TYPES
    # =====================================================

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
        "RecursionError"
    ]

    detected_type = None

    for error_type in error_types:

        if error_type in error_text:

            detected_type = error_type
            break

    if detected_type:

        error_info["type"] = detected_type

    # =====================================================
    # SUGGESTIONS
    # =====================================================

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
            "ตรวจสอบเงื่อนไขการหยุดของ Recursion"
    }

    if detected_type in suggestions:

        error_info["suggestion"] = suggestions[detected_type]

    return error_info


# =========================================================
# RUN PYTHON CODE
# =========================================================

def execute_python(code):

    temp_file = None

    try:

        # =================================================
        # ตรวจสอบ Syntax
        # =================================================

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
                "error_info": error_info
            }

        # =================================================
        # สร้าง Temporary File
        # =================================================

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as f:

            f.write(code)
            temp_file = f.name

        # =================================================
        # Run Python
        # =================================================

        result = subprocess.run(
            [
                sys.executable,
                temp_file
            ],
            capture_output=True,
            text=True,
            timeout=5
        )

        output = result.stdout
        error = result.stderr

        # =================================================
        # สำเร็จ
        # =================================================

        if result.returncode == 0:

            return {
                "success": True,
                "output": output,
                "error": None,
                "error_info": None
            }

        # =================================================
        # Runtime Error
        # =================================================

        error_info = analyze_error(
            error,
            code
        )

        return {
            "success": False,
            "output": output,
            "error": error,
            "error_info": error_info
        }

    # =====================================================
    # Timeout
    # =====================================================

    except subprocess.TimeoutExpired:

        error_info = {
            "type": "TimeoutError",
            "message": "โปรแกรมใช้เวลาทำงานนานเกินกำหนด",
            "line": None,
            "code": None,
            "suggestion": (
                "ตรวจสอบ Infinite Loop เช่น "
                "while ที่ไม่มีเงื่อนไขหยุด"
            )
        }

        return {
            "success": False,
            "output": "",
            "error": "Program Timeout",
            "error_info": error_info
        }

    # =====================================================
    # Other Error
    # =====================================================

    except Exception as e:

        error_info = {
            "type": type(e).__name__,
            "message": str(e),
            "line": None,
            "code": None,
            "suggestion": "ตรวจสอบ Server และลองใหม่อีกครั้ง"
        }

        return {
            "success": False,
            "output": "",
            "error": str(e),
            "error_info": error_info
        }

    # =====================================================
    # ลบ Temporary File
    # =====================================================

    finally:

        if temp_file and os.path.exists(temp_file):

            try:

                os.remove(temp_file)

            except OSError:

                pass


# =========================================================
# PRACTICE CHECKER 1
# =========================================================

def check_exercise_1(tree):

    has_name = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.Assign):

            for target in node.targets:

                if isinstance(target, ast.Name):

                    if target.id == "name":

                        has_name = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_name and has_print


# =========================================================
# PRACTICE CHECKER 2
# =========================================================

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

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_age and has_name and has_print


# =========================================================
# PRACTICE CHECKER 3
# =========================================================

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

        if isinstance(node, ast.BinOp):

            if isinstance(node.op, ast.Add):

                has_addition = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_a and has_b and has_addition and has_print


# =========================================================
# PRACTICE CHECKER 4
# =========================================================

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

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_first_name and has_last_name and has_print


# =========================================================
# PRACTICE CHECKER 5
# =========================================================

def check_exercise_5(tree):

    has_fruits = False
    has_list = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.Assign):

            for target in node.targets:

                if isinstance(target, ast.Name):

                    if target.id == "fruits":

                        has_fruits = True

            if isinstance(node.value, ast.List):

                has_list = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_fruits and has_list and has_print


# =========================================================
# PRACTICE CHECKER 6
# =========================================================

def check_exercise_6(tree):

    has_numbers = False
    has_tuple = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.Assign):

            for target in node.targets:

                if isinstance(target, ast.Name):

                    if target.id == "numbers":

                        has_numbers = True

            if isinstance(node.value, ast.Tuple):

                has_tuple = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_numbers and has_tuple and has_print


# =========================================================
# PRACTICE CHECKER 7
# =========================================================

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

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_if and has_comparison and has_print


# =========================================================
# PRACTICE CHECKER 8
# =========================================================

def check_exercise_8(tree):

    has_for = False
    has_range = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.For):

            has_for = True

        if isinstance(node, ast.Call):

            if isinstance(node.func, ast.Name):

                if node.func.id == "range":

                    has_range = True

                if node.func.id == "print":

                    has_print = True

    return has_for and has_range and has_print


# =========================================================
# PRACTICE CHECKER 9
# =========================================================

def check_exercise_9(tree):

    has_while = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.While):

            has_while = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_while and has_print


# =========================================================
# PRACTICE CHECKER 10
# =========================================================

def check_exercise_10(tree):

    has_function = False
    has_print = False

    for node in ast.walk(tree):

        if isinstance(node, ast.FunctionDef):

            has_function = True

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):

                has_print = True

    return has_function and has_print


# =========================================================
# EXERCISE VALIDATOR
# =========================================================

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
        10: check_exercise_10
    }

    checker = checkers.get(exercise)

    if not checker:

        return False

    return checker(tree)


# =========================================================
# MULTIPLAYER EVENTS
# =========================================================

@socketio.on("connect")
def handle_connect():
    print(f"🔌 Socket connected: {request.sid}")


@socketio.on("create_room")
def handle_create_room(data=None):

    data = data or {}

    player_name = data.get(
        "name",
        "Player 1"
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
            "ready": False
        }

        rooms[room_code] = {
            "players": {
                request.sid: player
            },
            "status": "waiting"
        }

    join_room(room_code)

    emit(
        "room_created",
        {
            "success": True,
            "roomCode": room_code,
            "playerId": request.sid,
            "state": get_room_state(room_code)
        }
    )

    print(
        f"🎮 Room created: {room_code} "
        f"by {player_name}"
    )


@socketio.on("join_room")
def handle_join_room(data=None):
    """ให้ผู้เล่นคนที่ 2 เข้าห้อง และส่งสถานะให้ทั้งสองฝั่ง"""

    data = data or {}

    room_code = str(
        data.get("roomCode", "")
    ).strip().upper()

    player_name = str(
        data.get("name", "Player 2")
    ).strip() or "Player 2"

    player_id = request.sid

    if not room_code:
        emit(
            "room_error",
            {"message": "กรุณาระบุ Room Code"},
            to=player_id
        )
        return

    with rooms_lock:
        room = rooms.get(room_code)

        if room is None:
            emit(
                "room_error",
                {"message": "ไม่พบห้องนี้ หรือ Room Code ไม่ถูกต้อง"},
                to=player_id
            )
            return

        if player_id in room["players"]:
            state = get_room_state(room_code)
            emit(
                "room_joined",
                {
                    "success": True,
                    "roomCode": room_code,
                    "playerId": player_id,
                    "state": state
                },
                to=player_id
            )
            return

        if len(room["players"]) >= 2:
            emit(
                "room_error",
                {"message": "ห้องนี้มีผู้เล่นครบแล้ว"},
                to=player_id
            )
            return

        if room["status"] == "playing":
            emit(
                "room_error",
                {"message": "เกมเริ่มแล้ว ไม่สามารถเข้าห้องได้"},
                to=player_id
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
            "ready": False
        }

        room["status"] = "waiting"
        state = get_room_state(room_code)

    # ต้อง join Socket.IO room ก่อนส่ง event
    join_room(room_code)

    emit(
        "room_joined",
        {
            "success": True,
            "roomCode": room_code,
            "playerId": player_id,
            "state": state
        },
        to=player_id
    )

    socketio.emit(
        "player_joined",
        {
            "playerId": player_id,
            "state": state
        },
        to=room_code
    )

    print(f"👤 {player_name} joined room {room_code}")


@socketio.on("player_move")
def handle_player_move(data):

    data = data or {}

    room_code = data.get("roomCode")

    if not room_code:

        return

    with rooms_lock:

        room = rooms.get(room_code)

        if not room:

            return

        player = room["players"].get(request.sid)

        if not player:

            return

        player["x"] = data.get(
            "x",
            player["x"]
        )

        player["y"] = data.get(
            "y",
            player["y"]
        )

        player["z"] = data.get(
            "z",
            player["z"]
        )

        player["rotation"] = data.get(
            "rotation",
            player["rotation"]
        )

        movement = {
            "playerId": request.sid,
            "x": player["x"],
            "y": player["y"],
            "z": player["z"],
            "rotation": player["rotation"]
        }

    emit(
        "player_moved",
        movement,
        to=room_code,
        include_self=False
    )


@socketio.on("player_ready")
def handle_player_ready(data):

    data = data or {}

    room_code = data.get("roomCode")

    if not room_code:

        return

    with rooms_lock:

        room = rooms.get(room_code)

        if not room:

            return

        player = room["players"].get(request.sid)

        if not player:

            return

        # สลับสถานะ Ready เพื่อให้ปุ่มพร้อม/ยกเลิกพร้อมทำงานจริง
        player["ready"] = not player.get("ready", False)

        all_ready = (
            len(room["players"]) == 2
            and all(
                p["ready"]
                for p in room["players"].values()
            )
        )

        if all_ready:
            room["status"] = "playing"
        else:
            room["status"] = "waiting"

        state = get_room_state(room_code)

    socketio.emit(
        "game_state",
        {
            "state": state
        },
        to=room_code
    )


@socketio.on("player_score")
def handle_player_score(data):

    data = data or {}

    room_code = data.get("roomCode")

    if not room_code:

        return

    with rooms_lock:

        room = rooms.get(room_code)

        if not room:

            return

        player = room["players"].get(request.sid)

        if not player:

            return

        try:

            points = int(
                data.get("points", 1)
            )

        except (TypeError, ValueError):

            points = 1

        player["score"] += points

        state = get_room_state(room_code)

        score_data = {
            "playerId": request.sid,
            "score": player["score"],
            "state": state
        }

    socketio.emit(
        "score_updated",
        score_data,
        to=room_code
    )


@socketio.on("game_event")
def handle_game_event(data):

    data = data or {}

    room_code = data.get("roomCode")

    if not room_code:

        return

    room = rooms.get(room_code)

    if not room:

        return

    emit(
        "game_event",
        {
            "playerId": request.sid,
            "event": data.get("event"),
            "data": data.get("data", {})
        },
        to=room_code,
        include_self=False
    )


@socketio.on("disconnect")
def handle_disconnect():

    disconnected_room = None

    with rooms_lock:

        for room_code, room in list(rooms.items()):

            if request.sid in room["players"]:

                del room["players"][request.sid]

                disconnected_room = room_code

                if len(room["players"]) == 0:

                    del rooms[room_code]

                else:

                    room["status"] = "waiting"

                break

    if disconnected_room:

        print(
            f"👋 Player disconnected from room "
            f"{disconnected_room}"
        )

        if disconnected_room in rooms:

            socketio.emit(
                "player_left",
                {
                    "playerId": request.sid,
                    "state": get_room_state(
                        disconnected_room
                    )
                },
                to=disconnected_room
            )


# =========================================================
# ROUTE: RUN PYTHON
# =========================================================

@app.route("/run-python", methods=["POST"])
def run_python():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "success": False,
            "error": "ไม่พบข้อมูล",
            "error_info": None
        }), 400

    code = data.get("code", "")

    if not isinstance(code, str):

        return jsonify({
            "success": False,
            "error": "code ต้องเป็นข้อความ",
            "error_info": None
        }), 400

    if not code.strip():

        return jsonify({
            "success": False,
            "error": "กรุณาเขียน Python ก่อน Run",
            "error_info": None
        }), 400

    result = execute_python(code)

    return jsonify(result), 200 if result["success"] else 400


# =========================================================
# ROUTE: CHECK EXERCISE
# =========================================================

@app.route("/check-exercise", methods=["POST"])
def check_exercise():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "success": False,
            "error": "ไม่พบข้อมูล"
        }), 400

    code = data.get("code", "")
    exercise = data.get("exercise")

    if not isinstance(code, str):

        return jsonify({
            "success": False,
            "error": "code ต้องเป็นข้อความ"
        }), 400

    try:

        exercise = int(exercise)

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "error": "exercise ต้องเป็นตัวเลข"
        }), 400

    if exercise < 1 or exercise > 10:

        return jsonify({
            "success": False,
            "error": "ไม่พบแบบฝึกหัดนี้"
        }), 400

    if not code.strip():

        return jsonify({
            "success": False,
            "error": "กรุณาเขียนโค้ดก่อนตรวจคำตอบ"
        }), 400

    # =====================================================
    # Run Code
    # =====================================================

    result = execute_python(code)

    if not result["success"]:

        return jsonify({
            "success": False,
            "output": result["output"],
            "error": result["error"],
            "correct": False,
            "exercise": exercise,
            "error_info": result["error_info"]
        }), 400

    # =====================================================
    # ตรวจคำตอบ
    # =====================================================

    correct = validate_exercise(
        code,
        exercise
    )

    return jsonify({
        "success": True,
        "output": result["output"],
        "error": None,
        "correct": correct,
        "exercise": exercise,
        "error_info": None
    }), 200


# =========================================================
# HOME / HEALTH CHECK
# =========================================================

@app.route("/socket-status", methods=["GET"])
def socket_status():
    with rooms_lock:
        return jsonify({
            "status": "online",
            "socketio": True,
            "rooms": len(rooms),
            "players": sum(
                len(room["players"])
                for room in rooms.values()
            )
        })


@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Adaptive Python Server is running",
        "status": "online",
        "endpoints": [
            "/run-python",
            "/check-exercise",
            "/socket-status",
            "Socket.IO Multiplayer"
        ]
    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    port = int(
        os.environ.get("PORT", 5000)
    )

    print("=" * 50)
    print("🐍 Adaptive Python Server")
    print("=" * 50)
    print(f"Server running on port {port}")
    print("Playground: POST /run-python")
    print("Practice:   POST /check-exercise")
    print("Multiplayer: Socket.IO")
    print("=" * 50)

    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=False,
        allow_unsafe_werkzeug=True
    )