import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function PlaygroundPage() {
  const [code, setCode] = useState(
`name = "Python"
age = 20

print("Hello", name)
print("Age:", age)`
  );

  const [output, setOutput] = useState("");
  const [errorInfo, setErrorInfo] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runPython = async () => {
    setIsRunning(true);
    setOutput("");
    setErrorInfo(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/run-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorInfo(
          result.error_info || {
            type: "Python Error",
            message: result.error || "เกิดข้อผิดพลาด",
          }
        );

        setOutput(result.output || "");
        return;
      }

      setOutput(result.output || "");

      if (result.error) {
        setErrorInfo(
          result.error_info || {
            type: "Python Error",
            message: result.error,
          }
        );
      }
    } catch (error) {
      setErrorInfo({
        type: "Connection Error",
        message: "ไม่สามารถเชื่อมต่อกับ Python Server ได้",
        suggestion: "กรุณาเปิด server.py ก่อนใช้งานระบบ",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode("");
    setOutput("");
    setErrorInfo(null);
  };

  const resetCode = () => {
    setCode(
`name = "Python"
age = 20

print("Hello", name)
print("Age:", age)`
    );

    setOutput("");
    setErrorInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      {/* Hero */}
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
            Python <span className="text-green-400">Playground</span>
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            พื้นที่สำหรับทดลองเขียนและรันโค้ด Python
            พร้อมระบบวิเคราะห์ข้อผิดพลาดและคำแนะนำในการแก้ไข
          </p>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              💻 Code Editor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              เขียน Python ได้อย่างอิสระ
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetCode}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium transition hover:bg-slate-700"
            >
              ↻ Reset
            </button>

            <button
              onClick={clearCode}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium transition hover:bg-slate-700"
            >
              Clear
            </button>

            <button
              onClick={runPython}
              disabled={isRunning}
              className="rounded-lg bg-green-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? "⏳ Running..." : "▶ Run Python"}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>

              <span className="ml-3 text-sm text-slate-400">
                main.py
              </span>
            </div>

            <span className="text-xs text-slate-500">
              Python
            </span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="min-h-[420px] w-full resize-y bg-slate-950 p-6 font-mono text-sm leading-7 text-green-300 outline-none"
            placeholder="เขียน Python ของคุณที่นี่..."
          />
        </div>

        {/* Result Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Output */}
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

          {/* Error Assistant */}
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
                  <div className="text-5xl">✅</div>

                  <p className="mt-4 font-medium text-slate-300">
                    ยังไม่พบข้อผิดพลาด
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    เมื่อรันโค้ด ระบบจะแสดงการวิเคราะห์ Error ที่นี่
                  </p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Error Type */}
                  <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                      Error Type
                    </p>

                    <p className="mt-2 text-lg font-bold text-red-300">
                      {errorInfo.type || "Python Error"}
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      ❌ เกิดอะไรขึ้น?
                    </p>

                    <div className="mt-2 rounded-lg bg-slate-950 p-4">
                      <p className="whitespace-pre-wrap font-mono text-sm text-red-300">
                        {errorInfo.message || "ไม่ทราบรายละเอียด Error"}
                      </p>
                    </div>
                  </div>

                  {/* Line */}
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

                  {/* Code */}
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

                  {/* Suggestion */}
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

        {/* Tips */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-semibold">
            💡 Python Playground Tips
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-slate-950 p-4">
              <div className="text-2xl">🐍</div>

              <h3 className="mt-3 font-semibold">
                ทดลองเขียนโค้ด
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                สามารถทดลองตัวแปร เงื่อนไข Loop Function
                และคำสั่ง Python ต่าง ๆ
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <div className="text-2xl">🔍</div>

              <h3 className="mt-3 font-semibold">
                วิเคราะห์ Error
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                เมื่อเกิดข้อผิดพลาด ระบบจะแสดงประเภท Error
                และตำแหน่งที่พบปัญหา
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <div className="text-2xl">🚀</div>

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

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Adaptive Python © 2026
      </footer>
    </div>
  );
}