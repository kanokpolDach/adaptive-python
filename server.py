from flask import Flask, request, jsonify
from flask_cors import CORS

import ast
import os
import sys
import tempfile
import subprocess
import traceback


app = Flask(__name__)
CORS(app)


# =========================================================
# ERROR ANALYZER
# =========================================================

def analyze_error(error_text, code):
    """
    วิเคราะห์ Error จาก Python
    """

    lines = code.splitlines()

    error_info = {
        "type": "Python Error",
        "message": error_text.strip(),
        "line": None,
        "code": None,
        "suggestion": "ตรวจสอบโค้ดและข้อความ Error แล้วลองแก้ไขอีกครั้ง"
    }

    # -----------------------------------------------------
    # Syntax Error / Indentation Error
    # -----------------------------------------------------

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
                "ให้สม่ำเสมอ โดยทั่วไป Python ใช้ 4 ช่องว่าง"
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

    # -----------------------------------------------------
    # Runtime Errors
    # -----------------------------------------------------

    error_lines = error_text.strip().splitlines()

    # หา line จาก Traceback
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

    # -----------------------------------------------------
    # Error Type
    # -----------------------------------------------------

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
    ]

    detected_type = None

    for error_type in error_types:
        if error_type in error_text:
            detected_type = error_type
            break

    if detected_type:
        error_info["type"] = detected_type

    # -----------------------------------------------------
    # Suggestions
    # -----------------------------------------------------

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
            "ตรวจสอบคำสั่ง import และชื่อสิ่งที่ต้องการนำเข้า",

        "OverflowError":
            "ค่าที่คำนวณมีขนาดใหญ่เกินกว่าที่ Python รองรับ",

        "AssertionError":
            "เงื่อนไขที่ใช้ใน assert ไม่เป็นจริง",

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

        # -----------------------------------------------
        # ตรวจสอบ Syntax ก่อน
        # -----------------------------------------------

        try:
            ast.parse(code)

        except SyntaxError as e:

            error_info = analyze_error(
                traceback.format_exc(),
                code
            )

            return {
                "success": False,
                "output": "",
                "error": str(e),
                "error_info": error_info
            }

        # -----------------------------------------------
        # สร้าง Temporary Python File
        # -----------------------------------------------

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as f:

            f.write(code)
            temp_file = f.name

        # -----------------------------------------------
        # Run Python
        # -----------------------------------------------

        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=5
        )

        output = result.stdout
        error = result.stderr

        # -----------------------------------------------
        # ไม่มี Error
        # -----------------------------------------------

        if result.returncode == 0:

            return {
                "success": True,
                "output": output,
                "error": None,
                "error_info": None
            }

        # -----------------------------------------------
        # มี Runtime Error
        # -----------------------------------------------

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

    except Exception as e:

        error_info = {
            "type": type(e).__name__,
            "message": str(e),
            "line": None,
            "code": None,
            "suggestion": "ตรวจสอบโค้ดและลองใหม่อีกครั้ง"
        }

        return {
            "success": False,
            "output": "",
            "error": str(e),
            "error_info": error_info
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


def check_exercise_10(tree):

    has_function = False
    has_print = False
    has_call = False

    function_names = set()

    for node in ast.walk(tree):

        if isinstance(node, ast.FunctionDef):

            has_function = True
            function_names.add(node.name)

        if isinstance(node, ast.Call):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "print"
            ):
                has_print = True

            if (
                isinstance(node.func, ast.Name)
                and node.func.id in function_names
            ):
                has_call = True

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
        10: check_exercise_10,

    }

    checker = checkers.get(exercise)

    if not checker:
        return False

    return checker(tree)


# =========================================================
# ROUTE: PLAYGROUND
# =========================================================

@app.route("/run-python", methods=["POST"])
def run_python():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "ไม่พบข้อมูล"
        }), 400

    code = data.get("code", "")

    if not isinstance(code, str):

        return jsonify({
            "error": "code ต้องเป็นข้อความ"
        }), 400

    if not code.strip():

        return jsonify({
            "error": "กรุณาเขียน Python ก่อน Run"
        }), 400

    result = execute_python(code)

    return jsonify({
        "output": result["output"],
        "error": result["error"],
        "error_info": result["error_info"]
    }), 200 if result["success"] else 400


# =========================================================
# ROUTE: PRACTICE
# =========================================================

@app.route("/check-exercise", methods=["POST"])
def check_exercise():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "ไม่พบข้อมูล"
        }), 400

    code = data.get("code", "")
    exercise = data.get("exercise")

    if not isinstance(code, str):

        return jsonify({
            "error": "code ต้องเป็นข้อความ"
        }), 400

    try:
        exercise = int(exercise)

    except (TypeError, ValueError):

        return jsonify({
            "error": "exercise ต้องเป็นตัวเลข"
        }), 400

    if exercise < 1 or exercise > 10:

        return jsonify({
            "error": "ไม่พบแบบฝึกหัดนี้"
        }), 400

    if not code.strip():

        return jsonify({
            "error": "กรุณาเขียนโค้ดก่อนตรวจคำตอบ"
        }), 400

    # -----------------------------------------------
    # Run code
    # -----------------------------------------------

    result = execute_python(code)

    if not result["success"]:

        return jsonify({
            "output": result["output"],
            "error": result["error"],
            "correct": False,
            "exercise": exercise,
            "error_info": result["error_info"]
        }), 400

    # -----------------------------------------------
    # ตรวจคำตอบ
    # -----------------------------------------------

    correct = validate_exercise(
        code,
        exercise
    )

    return jsonify({
        "output": result["output"],
        "error": None,
        "correct": correct,
        "exercise": exercise,
        "error_info": None
    }), 200


# =========================================================
# TEST ROUTE
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Adaptive Python Server is running",
        "endpoints": [
            "/run-python",
            "/check-exercise"
        ]
    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    print("=" * 50)
    print("🐍 Adaptive Python Server")
    print("=" * 50)
    print("Server: http://127.0.0.1:5000")
    print("Playground: POST /run-python")
    print("Practice:   POST /check-exercise")
    print("=" * 50)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )