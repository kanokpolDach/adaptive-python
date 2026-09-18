import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

// =========================================================
// RENDER BACKEND
// =========================================================

const API_URL = "https://adaptive-python.onrender.com";

// =========================================================
// DEFAULT CODE
// =========================================================

const DEFAULT_CODE = `name = "Python"
age = 20

print("Hello", name)
print("Age:", age)`;

// =========================================================
// PLAYGROUND PAGE
// =========================================================

export default function PlaygroundPage() {

  const [code, setCode] = useState(DEFAULT_CODE);

  const [output, setOutput] = useState("");

  const [errorInfo, setErrorInfo] = useState(null);

  const [isRunning, setIsRunning] = useState(false);

  // =======================================================
  // RUN PYTHON
  // =======================================================

  const runPython = async () => {

    if (!code.trim()) {

      setErrorInfo({
        type: "Code Error",
        message: "กรุณาเขียน Python ก่อน Run",
        suggestion: "ลองเขียนโค้ด Python แล้วกดปุ่ม ▶ Run Python"
      });

      setOutput("");

      return;
    }

    setIsRunning(true);
    setOutput("");
    setErrorInfo(null);

    try {

      const response = await fetch(
        `${API_URL}/run-python`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            code: code
          })
        }
      );

      const result = await response.json();

      // ===================================================
      // SERVER ERROR
      // ===================================================

      if (!response.ok) {

        setOutput(result.output || "");

        setErrorInfo(
          result.error_info || {
            type: "Python Error",
            message: result.error || "เกิดข้อผิดพลาด",
            suggestion:
              "ตรวจสอบโค้ด Python และลองแก้ไขอีกครั้ง"
          }
        );

        return;
      }

      // ===================================================
      // SUCCESS
      // ===================================================

      setOutput(result.output || "");

      if (result.error) {

        setErrorInfo(
          result.error_info || {
            type: "Python Error",
            message: result.error,
            suggestion:
              "ตรวจสอบข้อความ Error และแก้ไขโค้ด"
          }
        );

      } else {

        setErrorInfo(null);

      }

    } catch (error) {

      console.error("Python Server Error:", error);

      setErrorInfo({
        type: "Connection Error",

        message:
          "ไม่สามารถเชื่อมต่อกับ Python Server ได้",

        suggestion:
          "ตรวจสอบ Internet และตรวจสอบว่า Render Server กำลังทำงานอยู่"
      });

      setOutput("");

    } finally {

      setIsRunning(false);

    }
  };


  // =======================================================
  // CLEAR CODE
  // =======================================================

  const clearCode = () => {

    setCode("");

    setOutput("");

    setErrorInfo(null);

  };


  // =======================================================
  // RESET CODE
  // =======================================================

  const resetCode = () => {

    setCode(DEFAULT_CODE);

    setOutput("");

    setErrorInfo(null);

  };


  // =======================================================
  // KEYBOARD SHORTCUT
  // Ctrl + Enter = Run
  // =======================================================

  const handleKeyDown = (event) => {

    if (event.ctrlKey && event.key === "Enter") {

      event.preventDefault();

      if (!isRunning) {
        runPython();
      }

    }
  };


  // =======================================================
  // LINE NUMBERS
  // =======================================================

  const lineCount = Math.max(
    code.split("\n").length,
    1
  );

  const lineNumbers = Array.from(
    { length: lineCount },
    (_, index) => index + 1
  );


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Header />


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">

        <div className="mx-auto max-w-7xl px-6 py-12">

          <div className="mb-4">

            <Link
              to="/"
              className="text-sm text-slate-400 transition hover:text-green-400"
            >
              ← กลับหน้าหลัก
            </Link>

          </div>


          <h1 className="text-4xl font-bold md:text-5xl">

            Python{" "}

            <span className="text-green-400">
              Playground
            </span>

          </h1>


          <p className="mt-4 max-w-2xl text-slate-400">

            พื้นที่สำหรับทดลองเขียนและรันโค้ด Python
            พร้อมระบบวิเคราะห์ข้อผิดพลาดและคำแนะนำในการแก้ไข

          </p>

        </div>

      </section>



      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="text-xl font-semibold">
              💻 Code Editor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              เขียน Python ได้อย่างอิสระ
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            {/* RESET */}

            <button
              onClick={resetCode}
              disabled={isRunning}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↻ Reset
            </button>


            {/* CLEAR */}

            <button
              onClick={clearCode}
              disabled={isRunning}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>


            {/* RUN */}

            <button
              onClick={runPython}
              disabled={isRunning}
              className="rounded-lg bg-green-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isRunning
                ? "⏳ Running..."
                : "▶ Run Python"
              }

            </button>

          </div>

        </div>



        {/* =================================================
            CODE EDITOR
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">


          {/* EDITOR HEADER */}

          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800 px-4 py-3">

            <div className="flex items-center gap-2">

              <div className="h-3 w-3 rounded-full bg-red-500" />

              <div className="h-3 w-3 rounded-full bg-yellow-500" />

              <div className="h-3 w-3 rounded-full bg-green-500" />

              <span className="ml-3 text-sm text-slate-400">
                main.py
              </span>

            </div>


            <span className="text-xs text-slate-500">
              Python
            </span>

          </div>



          {/* CODE AREA */}

          <div className="flex min-h-[420px] bg-slate-950">

            {/* LINE NUMBERS */}

            <div className="select-none border-r border-slate-800 bg-slate-900 px-4 py-6 text-right font-mono text-sm leading-7 text-slate-600">

              {lineNumbers.map((number) => (

                <div key={number}>
                  {number}
                </div>

              ))}

            </div>


            {/* TEXTAREA */}

            <textarea
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="min-h-[420px] flex-1 resize-y bg-slate-950 p-6 font-mono text-sm leading-7 text-green-300 outline-none"
              placeholder="เขียน Python ของคุณที่นี่..."
            />

          </div>


          {/* EDITOR FOOTER */}

          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-2">

            <span className="text-xs text-slate-500">

              {lineCount} lines

            </span>


            <span className="text-xs text-slate-600">

              Ctrl + Enter เพื่อ Run

            </span>

          </div>

        </div>



        {/* =================================================
            RESULT GRID
        ================================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">


          {/* =================================================
              OUTPUT
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-5 py-4">

              <h2 className="font-semibold">
                📤 Output
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                ผลลัพธ์จากการรันโปรแกรม
              </p>

            </div>


            <div className="min-h-[260px] bg-black p-5">

              {output ? (

                <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-green-400">
                  {output}
                </pre>

              ) : (

                <div className="flex min-h-[210px] items-center justify-center text-sm text-slate-600">

                  ยังไม่มี Output

                </div>

              )}

            </div>

          </section>



          {/* =================================================
              ERROR ASSISTANT
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-5 py-4">

              <h2 className="font-semibold">
                🧠 Smart Error Assistant
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                วิเคราะห์ข้อผิดพลาดและแนะนำวิธีแก้
              </p>

            </div>


            <div className="min-h-[260px] p-5">


              {!errorInfo ? (

                <div className="flex min-h-[210px] flex-col items-center justify-center text-center">

                  <div className="text-5xl">
                    ✅
                  </div>

                  <p className="mt-4 font-medium text-slate-300">
                    ยังไม่พบข้อผิดพลาด
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    เมื่อรันโค้ด ระบบจะแสดงการวิเคราะห์ Error ที่นี่
                  </p>

                </div>

              ) : (

                <div className="space-y-5">


                  {/* ERROR TYPE */}

                  <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                      Error Type
                    </p>

                    <p className="mt-2 text-lg font-bold text-red-300">

                      {errorInfo.type || "Python Error"}

                    </p>

                  </div>



                  {/* MESSAGE */}

                  <div>

                    <p className="text-sm font-semibold text-slate-300">
                      ❌ เกิดอะไรขึ้น?
                    </p>

                    <div className="mt-2 rounded-lg bg-slate-950 p-4">

                      <p className="whitespace-pre-wrap font-mono text-sm text-red-300">

                        {errorInfo.message ||
                          "ไม่ทราบรายละเอียด Error"}

                      </p>

                    </div>

                  </div>



                  {/* LINE */}

                  {errorInfo.line && (

                    <div>

                      <p className="text-sm font-semibold text-slate-300">
                        📍 บรรทัดที่เกิดปัญหา
                      </p>

                      <p className="mt-2 inline-block rounded-lg bg-yellow-500/10 px-3 py-2 font-mono text-sm text-yellow-300">

                        Line {errorInfo.line}

                      </p>

                    </div>

                  )}



                  {/* CODE */}

                  {errorInfo.code && (

                    <div>

                      <p className="text-sm font-semibold text-slate-300">
                        🔎 จุดที่พบปัญหา
                      </p>

                      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">

                        {errorInfo.code}

                      </pre>

                    </div>

                  )}



                  {/* SUGGESTION */}

                  {errorInfo.suggestion && (

                    <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-4">

                      <p className="text-sm font-semibold text-green-400">
                        💡 คำแนะนำ
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">

                        {errorInfo.suggestion}

                      </p>

                    </div>

                  )}

                </div>

              )}

            </div>

          </section>

        </div>



        {/* =================================================
            SERVER STATUS
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="font-semibold">
                🌐 Python Server
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Backend สำหรับประมวลผล Python
              </p>

            </div>


            <a
              href={API_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-2 text-sm text-green-400 transition hover:bg-green-950/50"
            >
              ตรวจสอบ Server →
            </a>

          </div>

        </section>



        {/* =================================================
            TIPS
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-semibold">
            💡 Python Playground Tips
          </h2>


          <div className="mt-5 grid gap-4 md:grid-cols-3">


            {/* TIP 1 */}

            <div className="rounded-xl bg-slate-950 p-4">

              <div className="text-2xl">
                🐍
              </div>

              <h3 className="mt-3 font-semibold">
                ทดลองเขียนโค้ด
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                สามารถทดลองตัวแปร เงื่อนไข Loop
                Function และคำสั่ง Python ต่าง ๆ

              </p>

            </div>



            {/* TIP 2 */}

            <div className="rounded-xl bg-slate-950 p-4">

              <div className="text-2xl">
                🔍
              </div>

              <h3 className="mt-3 font-semibold">
                วิเคราะห์ Error
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                เมื่อเกิดข้อผิดพลาด ระบบจะแสดงประเภท Error
                และตำแหน่งที่พบปัญหา

              </p>

            </div>



            {/* TIP 3 */}

            <div className="rounded-xl bg-slate-950 p-4">

              <div className="text-2xl">
                🚀
              </div>

              <h3 className="mt-3 font-semibold">
                เรียนรู้จากการลองผิด
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                ทดลองแก้ไขโค้ดและ Run ใหม่
                เพื่อเรียนรู้จากข้อผิดพลาดของตัวเอง

              </p>

            </div>

          </div>

        </section>

      </main>



      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">

        Adaptive Python © 2026

      </footer>

    </div>
  );
}