import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function PlaygroundPage() {
  const [code, setCode] = useState(
`name = "Python"

print(name)`
  );

  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [runCount, setRunCount] = useState(() => {
    return Number(localStorage.getItem("playground_runs") || 0);
  });

  const [successCount, setSuccessCount] = useState(() => {
    return Number(localStorage.getItem("playground_success") || 0);
  });


  // =========================
  // Run Python
  // =========================

  const runPython = async () => {

    setIsRunning(true);
    setOutput("");
    setError(null);

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/run-python",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            code: code,
          }),
        }
      );


      const result = await response.json();


      const newRunCount = runCount + 1;

      setRunCount(newRunCount);

      localStorage.setItem(
        "playground_runs",
        newRunCount
      );


      if (!response.ok) {

        setError(
          result.error_info || {
            title: "เกิดข้อผิดพลาด",
            message: result.error || "ไม่สามารถรัน Code ได้",
            line: null,
            suggestion: "ตรวจสอบ Code แล้วลองใหม่อีกครั้ง",
          }
        );

        return;
      }


      if (result.error) {

        setError(
          result.error_info || {
            title: "เกิดข้อผิดพลาด",
            message: result.error,
            line: null,
            suggestion: "ตรวจสอบ Code แล้วลองใหม่อีกครั้ง",
          }
        );

        return;
      }


      setOutput(result.output || "ไม่มี Output");


      const newSuccessCount = successCount + 1;

      setSuccessCount(newSuccessCount);

      localStorage.setItem(
        "playground_success",
        newSuccessCount
      );

    } catch (err) {

      setError({
        title: "ไม่สามารถเชื่อมต่อ Python Server",
        message:
          "ไม่สามารถเชื่อมต่อกับ Python Server ได้",
        line: null,
        suggestion:
          "ตรวจสอบว่า server.py กำลังทำงานอยู่ที่ http://127.0.0.1:5000",
      });

    } finally {

      setIsRunning(false);

    }
  };


  // =========================
  // Reset
  // =========================

  const resetCode = () => {

    setCode(
`name = "Python"

print(name)`
    );

    setOutput("");
    setError(null);
  };


  // =========================
  // Clear
  // =========================

  const clearCode = () => {

    setCode("");
    setOutput("");
    setError(null);

  };


  // =========================
  // Keyboard Shortcut
  // Ctrl + Enter
  // =========================

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
      ) {

        event.preventDefault();

        runPython();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  });


  // =========================
  // Line Count
  // =========================

  const lineCount = Math.max(
    code.split("\n").length,
    1
  );


  const lines = Array.from(
    { length: lineCount },
    (_, index) => index + 1
  );


  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <Header />


      <main className="mx-auto max-w-7xl px-6 py-8">


        {/* =========================
            Header
        ========================= */}

        <div className="mb-8">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <div className="mb-2 text-sm text-blue-400">
                💻 Python Playground
              </div>

              <h1 className="text-3xl font-bold">
                ทดลองเขียน Python
              </h1>

              <p className="mt-2 text-slate-400">
                เขียน Python ได้อย่างอิสระ และเรียนรู้จาก Error
              </p>

            </div>


            <Link
              to="/practice"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              📚 ไปที่แบบฝึกหัด
            </Link>

          </div>

        </div>


        {/* =========================
            Statistics
        ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="text-sm text-slate-500">
              จำนวนครั้งที่ Run
            </div>

            <div className="mt-2 text-3xl font-bold">
              {runCount}
            </div>

          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="text-sm text-slate-500">
              Run สำเร็จ
            </div>

            <div className="mt-2 text-3xl font-bold text-green-400">
              {successCount}
            </div>

          </div>

        </div>


        {/* =========================
            Editor
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">


          {/* Editor Header */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex gap-1.5">

                <span className="h-3 w-3 rounded-full bg-red-500"></span>

                <span className="h-3 w-3 rounded-full bg-yellow-500"></span>

                <span className="h-3 w-3 rounded-full bg-green-500"></span>

              </div>

              <span className="text-sm text-slate-400">
                Python
              </span>

            </div>


            <div className="text-xs text-slate-500">
              Ctrl + Enter เพื่อ Run
            </div>

          </div>


          {/* Editor */}

          <div className="flex min-h-[420px] bg-slate-950">


            {/* Line Numbers */}

            <div className="select-none border-r border-slate-800 bg-slate-900 px-4 py-5 text-right font-mono text-sm leading-7 text-slate-600">

              {lines.map((line) => (

                <div key={line}>
                  {line}
                </div>

              ))}

            </div>


            {/* Textarea */}

            <textarea
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              spellCheck={false}
              className="min-h-[420px] flex-1 resize-none bg-slate-950 p-5 font-mono text-sm leading-7 text-green-300 outline-none"
              placeholder="เขียน Python Code ที่นี่..."
            />

          </div>


          {/* Buttons */}

          <div className="flex flex-wrap gap-3 border-t border-slate-800 bg-slate-900 p-4">


            <button
              onClick={runPython}
              disabled={isRunning}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isRunning
                ? "⏳ กำลัง Run..."
                : "▶ Run Python"}

            </button>


            <button
              onClick={resetCode}
              className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800"
            >
              ↻ Reset
            </button>


            <button
              onClick={clearCode}
              className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800"
            >
              🗑 Clear
            </button>

          </div>

        </div>


        {/* =========================
            Error
        ========================= */}

        {error && (

          <div className="mt-6 overflow-hidden rounded-2xl border border-red-900 bg-red-950/40">


            <div className="border-b border-red-900 px-5 py-4">

              <div className="flex items-center gap-3">

                <span className="text-2xl">
                  ❌
                </span>

                <div>

                  <h2 className="font-bold text-red-300">
                    {error.title || "Python Error"}
                  </h2>

                  {error.line && (

                    <p className="mt-1 text-sm text-red-400">
                      พบปัญหาที่บรรทัด {error.line}
                    </p>

                  )}

                </div>

              </div>

            </div>


            <div className="space-y-5 p-5">


              {/* Message */}

              <div>

                <div className="mb-2 text-sm font-bold text-slate-400">
                  🔍 เกิดอะไรขึ้น?
                </div>

                <div className="rounded-xl bg-slate-950 p-4 font-mono text-sm text-red-300">

                  {error.message}

                </div>

              </div>


              {/* Suggestion */}

              <div>

                <div className="mb-2 text-sm font-bold text-slate-400">
                  💡 วิธีแก้ไข
                </div>

                <div className="rounded-xl bg-slate-950 p-4 text-sm leading-7 text-slate-300">

                  {error.suggestion}

                </div>

              </div>


              {/* Error type */}

              {error.type && (

                <div className="text-xs text-slate-500">
                  Error Type: {error.type}
                </div>

              )}

            </div>

          </div>

        )}


        {/* =========================
            Output
        ========================= */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">


          <div className="border-b border-slate-800 px-5 py-4">

            <div className="flex items-center gap-2">

              <span>
                🖥️
              </span>

              <h2 className="font-bold">
                Output
              </h2>

            </div>

          </div>


          <div className="min-h-[160px] bg-black p-5">

            {output ? (

              <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-green-300">
                {output}
              </pre>

            ) : (

              <div className="text-sm text-slate-600">
                Output จะแสดงที่นี่...
              </div>

            )}

          </div>

        </div>


        {/* =========================
            Help
        ========================= */}

        <div className="mt-6 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-5">

          <h2 className="font-bold text-blue-300">
            💡 เคล็ดลับ
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">

            <li>
              • กด <b className="text-white">Ctrl + Enter</b> เพื่อ Run Code
            </li>

            <li>
              • ถ้า Code ผิด ระบบจะแสดงบรรทัดที่มีปัญหา
            </li>

            <li>
              • ระบบจะแนะนำแนวทางแก้ไข Error ให้
            </li>

            <li>
              • Playground ไม่เกี่ยวข้องกับ XP หรือคะแนนแบบฝึกหัด
            </li>

          </ul>

        </div>


      </main>

    </div>

  );
}