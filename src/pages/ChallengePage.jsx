import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const challenges = [
  {
    id: 1,
    title: "ตรวจสอบอายุ",
    difficulty: "⭐ Easy",
    topic: "If / Else",
    description:
      "เขียนโปรแกรมตรวจสอบอายุ ถ้าอายุ 18 ปีขึ้นไป ให้แสดง Adult ถ้าน้อยกว่า 18 ปี ให้แสดง Child",
    requirement: [
      "สร้างตัวแปร age และกำหนดค่าเป็น 20",
      "ใช้ if / else ตรวจสอบอายุ",
      "ถ้าอายุ 18 ปีขึ้นไป ให้แสดง Adult",
      "ถ้าน้อยกว่า 18 ปี ให้แสดง Child",
    ],
    starterCode: `age = 20

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Adult",
    hints: [
      "ลองใช้คำสั่ง if / else",
      "ลองเปรียบเทียบค่า age กับ 18",
      "เงื่อนไขควรตรวจสอบว่า age มากกว่าหรือเท่ากับ 18 หรือไม่",
    ],
  },

  {
    id: 2,
    title: "คำนวณผลรวม",
    difficulty: "⭐ Easy",
    topic: "Calculation",
    description:
      "เขียนโปรแกรมหาผลรวมของตัวเลข 2 จำนวน แล้วแสดงผลลัพธ์ออกทางหน้าจอ",
    requirement: [
      "สร้างตัวแปร a และกำหนดค่าเป็น 15",
      "สร้างตัวแปร b และกำหนดค่าเป็น 25",
      "หาผลรวมของ a และ b",
      "แสดงผลลัพธ์ออกทางหน้าจอ",
    ],
    starterCode: `a = 15
b = 25

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "40",
    hints: [
      "ต้องนำค่าของตัวแปรทั้งสองมารวมกัน",
      "เครื่องหมาย + ใช้สำหรับการบวก",
      "ลองนำผลลัพธ์จาก a และ b ไปแสดงด้วย print()",
    ],
  },

  {
    id: 3,
    title: "ตรวจสอบเลขคู่",
    difficulty: "⭐ Easy",
    topic: "If / Else",
    description:
      "เขียนโปรแกรมตรวจสอบว่าตัวเลขเป็นเลขคู่หรือเลขคี่",
    requirement: [
      "สร้างตัวแปร number และกำหนดค่าเป็น 10",
      "ตรวจสอบว่าตัวเลขหารด้วย 2 ลงตัวหรือไม่",
      "ถ้าเป็นเลขคู่ ให้แสดง Even",
      "ถ้าเป็นเลขคี่ ให้แสดง Odd",
    ],
    starterCode: `number = 10

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Even",
    hints: [
      "ลองนึกถึงตัวดำเนินการที่ใช้หาเศษจากการหาร",
      "เลขคู่จะมีเศษจากการหารด้วย 2 เป็น 0",
      "ลองใช้ if / else ร่วมกับตัวดำเนินการ %",
    ],
  },

  {
    id: 4,
    title: "แสดงสมาชิกใน List",
    difficulty: "⭐⭐ Medium",
    topic: "List",
    description:
      "สร้าง List ที่มีชื่อผลไม้ แล้วแสดงชื่อผลไม้แต่ละรายการออกทางหน้าจอ",
    requirement: [
      'สร้าง List ชื่อ fruits',
      'เพิ่ม "Apple", "Banana", "Orange" ลงใน List',
      "ใช้ Loop เพื่อแสดงสมาชิกทุกตัว",
    ],
    starterCode: `fruits = ["Apple", "Banana", "Orange"]

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Apple\nBanana\nOrange",
    hints: [
      "List สามารถเก็บข้อมูลได้หลายค่า",
      "ลองใช้ for loop เพื่อเข้าถึงสมาชิกทีละตัว",
      "ใช้ print() ภายใน Loop เพื่อแสดงสมาชิก",
    ],
  },

  {
    id: 5,
    title: "คำนวณคะแนน",
    difficulty: "⭐⭐ Medium",
    topic: "If / Else",
    description:
      "เขียนโปรแกรมตรวจสอบคะแนนสอบ ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง Pass ถ้าน้อยกว่า 50 ให้แสดง Fail",
    requirement: [
      "สร้างตัวแปร score และกำหนดค่าเป็น 75",
      "ตรวจสอบคะแนน",
      "คะแนนตั้งแต่ 50 ขึ้นไป ให้แสดง Pass",
      "คะแนนน้อยกว่า 50 ให้แสดง Fail",
    ],
    starterCode: `score = 75

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Pass",
    hints: [
      "ลองใช้ if / else",
      "ต้องเปรียบเทียบ score กับ 50",
      "เงื่อนไขต้องครอบคลุมกรณีคะแนนตั้งแต่ 50 ขึ้นไป",
    ],
  },

  {
    id: 6,
    title: "นับเลข 1 ถึง 10",
    difficulty: "⭐⭐ Medium",
    topic: "For Loop",
    description:
      "เขียนโปรแกรมแสดงตัวเลขตั้งแต่ 1 ถึง 10 โดยใช้ For Loop",
    requirement: [
      "ใช้ for loop",
      "แสดงตัวเลขตั้งแต่ 1",
      "แสดงไปจนถึง 10",
      "แต่ละตัวเลขต้องอยู่คนละบรรทัด",
    ],
    starterCode: `# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
    hints: [
      "ลองใช้ range()",
      "range() สามารถกำหนดจุดเริ่มต้นและจุดสิ้นสุดได้",
      "จำไว้ว่าค่าปลายทางของ range() จะไม่ถูกรวม",
    ],
  },

  {
    id: 7,
    title: "หาผลรวมด้วย Loop",
    difficulty: "⭐⭐ Medium",
    topic: "Loop + Variable",
    description:
      "หาผลรวมของตัวเลขตั้งแต่ 1 ถึง 5 โดยใช้ Loop",
    requirement: [
      "สร้างตัวแปร total สำหรับเก็บผลรวม",
      "ใช้ Loop ตั้งแต่ 1 ถึง 5",
      "นำค่าที่ได้จาก Loop มาบวกสะสม",
      "แสดงผลรวม",
    ],
    starterCode: `total = 0

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "15",
    hints: [
      "ต้องมีตัวแปรสำหรับเก็บค่าผลรวม",
      "ในแต่ละรอบให้นำค่าปัจจุบันมาบวกกับ total",
      "หลังจาก Loop จบจึงแสดงค่า total",
    ],
  },

  {
    id: 8,
    title: "สร้าง Function",
    difficulty: "⭐⭐⭐ Hard",
    topic: "Function",
    description:
      "สร้าง Function ชื่อ greet() และให้ Function แสดงข้อความ Hello Python",
    requirement: [
      "สร้าง Function ชื่อ greet",
      "ภายใน Function ให้แสดง Hello Python",
      "เรียกใช้ Function",
    ],
    starterCode: `# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Hello Python",
    hints: [
      "Function ใน Python เริ่มต้นด้วยคำสั่ง def",
      "ชื่อ Function ต้องเป็น greet",
      "อย่าลืมเรียกใช้ Function หลังจากสร้าง",
    ],
  },

  {
    id: 9,
    title: "หาค่าสูงสุด",
    difficulty: "⭐⭐⭐ Hard",
    topic: "List + Loop",
    description:
      "เขียนโปรแกรมหาค่าที่มากที่สุดใน List",
    requirement: [
      "สร้าง List numbers = [10, 25, 8, 40, 15]",
      "ค้นหาค่าที่มากที่สุด",
      "แสดงค่าที่มากที่สุดออกทางหน้าจอ",
    ],
    starterCode: `numbers = [10, 25, 8, 40, 15]

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "40",
    hints: [
      "ข้อมูลที่ต้องตรวจสอบอยู่ใน List",
      "สามารถใช้ตัวแปรเก็บค่าที่มากที่สุดในขณะตรวจสอบ",
      "Python มีฟังก์ชันที่สามารถช่วยหาค่าสูงสุดของ List ได้",
    ],
  },

  {
    id: 10,
    title: "Mini Project: ระบบตรวจสอบเกรด",
    difficulty: "⭐⭐⭐⭐ Advanced",
    topic: "Mini Project",
    description:
      "สร้างโปรแกรมตรวจสอบคะแนนและแสดงเกรด โดยใช้เงื่อนไขในการแบ่งระดับคะแนน",
    requirement: [
      "สร้างตัวแปร score และกำหนดค่าเป็น 85",
      "80 ขึ้นไป แสดง Grade A",
      "70–79 แสดง Grade B",
      "60–69 แสดง Grade C",
      "50–59 แสดง Grade D",
      "น้อยกว่า 50 แสดง Grade F",
    ],
    starterCode: `score = 85

# เขียนโค้ดของคุณที่นี่
`,
    expectedOutput: "Grade A",
    hints: [
      "โจทย์นี้ต้องใช้ if / elif / else",
      "เริ่มตรวจสอบจากช่วงคะแนนที่สูงก่อน",
      "ตรวจสอบให้ครบทุกช่วงคะแนน",
    ],
  },
];

export default function ChallengePage() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [code, setCode] = useState(challenges[0].starterCode);
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [running, setRunning] = useState(false);

  const challenge = challenges[currentChallenge];

  const loadChallenge = (index) => {
    setCurrentChallenge(index);
    setCode(challenges[index].starterCode);
    setOutput("");
    setMessage("");
    setHintLevel(0);
  };

  const runChallenge = async () => {
    setRunning(true);
    setOutput("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/run-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        setOutput(result.error || "เกิดข้อผิดพลาด");
        setMessage("error");
        return;
      }

      const actualOutput = result.output.trim();

      setOutput(actualOutput);

      if (actualOutput === challenge.expectedOutput) {
        setMessage("correct");

        if (!completed.includes(challenge.id)) {
          setCompleted([...completed, challenge.id]);
        }
      } else {
        setMessage("wrong");
      }
    } catch (error) {
      setOutput("ไม่สามารถเชื่อมต่อกับ Python Server ได้");
      setMessage("error");
    } finally {
      setRunning(false);
    }
  };

  const showHint = () => {
    if (hintLevel < challenge.hints.length) {
      setHintLevel(hintLevel + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-slate-400 transition hover:text-green-400"
          >
            ← กลับหน้า Home
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1 text-sm text-green-400">
                🧪 Code Challenge
              </div>

              <h1 className="text-4xl font-bold md:text-5xl">
                ท้าทายความสามารถ Python
              </h1>

              <p className="mt-3 text-slate-400">
                เขียนโปรแกรมด้วยตัวเองและพิสูจน์ว่าคุณเข้าใจ Python
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
              <p className="text-sm text-slate-400">
                Challenge Progress
              </p>

              <p className="mt-1 text-xl font-bold text-green-400">
                {completed.length} / {challenges.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">ความคืบหน้า</span>
            <span className="text-green-400">
              {Math.round(
                (completed.length / challenges.length) * 100
              )}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${(completed.length / challenges.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* Challenge List */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-4 text-lg font-bold">
              🧪 Challenges
            </h2>

            <div className="space-y-2">
              {challenges.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => loadChallenge(index)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    currentChallenge === index
                      ? "bg-green-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>
                    {completed.includes(item.id) ? "✅" : "○"}{" "}
                    Challenge {item.id}
                  </span>

                  <span className="text-xs">
                    {item.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <section className="space-y-6">

            {/* Challenge Description */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <p className="text-sm text-green-400">
                    Challenge {challenge.id}
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    {challenge.title}
                  </h2>
                </div>

                <div className="flex h-fit gap-2">
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
                    {challenge.difficulty}
                  </span>

                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                    {challenge.topic}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-800 p-5">
                <h3 className="font-bold text-white">
                  📋 โจทย์
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {challenge.description}
                </p>
              </div>

              <div className="mt-5">
                <h3 className="font-bold">
                  🎯 สิ่งที่ต้องทำ
                </h3>

                <ul className="mt-3 space-y-2">
                  {challenge.requirement.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-slate-300"
                    >
                      <span className="text-green-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Editor */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <h3 className="font-bold">
                  💻 Code Editor
                </h3>

                <span className="text-xs text-slate-500">
                  Python
                </span>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="min-h-[350px] w-full resize-y bg-slate-950 p-5 font-mono text-sm leading-7 text-green-300 outline-none"
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-800 p-5">
                <button
                  onClick={runChallenge}
                  disabled={running}
                  className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {running ? "⏳ กำลังตรวจสอบ..." : "▶ Run & Submit"}
                </button>

                <button
                  onClick={() => {
                    setCode(challenge.starterCode);
                    setOutput("");
                    setMessage("");
                  }}
                  className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  ↻ Reset
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-bold">
                🖥 Output
              </h3>

              <div className="mt-4 min-h-[100px] rounded-xl bg-black p-5 font-mono text-sm">
                {output ? (
                  <pre className="whitespace-pre-wrap text-slate-300">
                    {output}
                  </pre>
                ) : (
                  <span className="text-slate-600">
                    Output จะแสดงที่นี่...
                  </span>
                )}
              </div>

              {message === "correct" && (
                <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <p className="font-bold text-green-400">
                    🎉 ถูกต้อง!
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    คุณผ่าน Challenge นี้แล้ว
                  </p>
                </div>
              )}

              {message === "wrong" && (
                <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="font-bold text-yellow-400">
                    💡 ยังไม่ตรงกับผลลัพธ์ที่ต้องการ
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    ลองตรวจสอบเงื่อนไขและแนวคิดของโจทย์อีกครั้ง
                  </p>
                </div>
              )}

              {message === "error" && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <p className="font-bold text-red-400">
                    ❌ เกิดข้อผิดพลาด
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    ลองอ่าน Error และตรวจสอบโค้ดของคุณอีกครั้ง
                  </p>
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-yellow-400">
                    💡 Smart Hint
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    คำใบ้จะช่วยให้คุณคิดต่อเอง โดยไม่แสดงคำตอบ
                  </p>
                </div>

                <button
                  onClick={showHint}
                  disabled={hintLevel >= challenge.hints.length}
                  className="rounded-xl bg-yellow-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {hintLevel >= challenge.hints.length
                    ? "ดูครบแล้ว"
                    : "💡 ขอ Hint"}
                </button>
              </div>

              {hintLevel > 0 && (
                <div className="mt-5 space-y-3">
                  {challenge.hints
                    .slice(0, hintLevel)
                    .map((hint, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-slate-900 p-4"
                      >
                        <p className="text-xs font-bold text-yellow-400">
                          HINT {index + 1}
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {hint}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <button
                disabled={currentChallenge === 0}
                onClick={() =>
                  loadChallenge(currentChallenge - 1)
                }
                className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Challenge ก่อนหน้า
              </button>

              <button
                disabled={
                  currentChallenge === challenges.length - 1
                }
                onClick={() =>
                  loadChallenge(currentChallenge + 1)
                }
                className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Challenge ถัดไป →
              </button>
            </div>

          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © Adaptive Python — Learn, Practice, Challenge
      </footer>
    </div>
  );
}