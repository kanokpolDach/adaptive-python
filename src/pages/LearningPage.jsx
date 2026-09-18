import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const lessons = [
  {
    id: 1,
    title: "พื้นฐาน Python และการแสดงผล",
    icon: "🐍",
    description: "ทำความรู้จัก Python และคำสั่ง print()",
    content: [
      {
        title: "Python คืออะไร?",
        text: "Python เป็นภาษาโปรแกรมที่มีรูปแบบคำสั่งอ่านและเข้าใจได้ง่าย เหมาะสำหรับผู้เริ่มต้นเรียนรู้การเขียนโปรแกรม",
      },
      {
        title: "คำสั่ง print()",
        text: "ใช้สำหรับแสดงข้อมูลหรือข้อความออกทางหน้าจอ",
      },
    ],
    example: `print("Hello Python")`,
    concept: "คำสั่ง print() ใช้สำหรับแสดงผลข้อมูลออกทางหน้าจอ",
  },

  {
    id: 2,
    title: "ตัวแปรและชนิดข้อมูล",
    icon: "📦",
    description: "เรียนรู้การเก็บข้อมูลด้วยตัวแปร",
    content: [
      {
        title: "ตัวแปรคืออะไร?",
        text: "ตัวแปรใช้สำหรับเก็บข้อมูลที่โปรแกรมต้องการนำไปใช้งาน โดยตัวแปรจะมีชื่อสำหรับอ้างอิงข้อมูลนั้น",
      },
      {
        title: "ชนิดข้อมูลพื้นฐาน",
        text: "ข้อมูลใน Python มีหลายชนิด เช่น จำนวนเต็ม จำนวนทศนิยม ข้อความ และค่าความจริง",
      },
    ],
    example: `name = "Python"
age = 20

print(name)
print(age)`,
    concept: "ตัวแปรช่วยให้เราสามารถเก็บและนำข้อมูลกลับมาใช้งานได้",
  },

  {
    id: 3,
    title: "การคำนวณ",
    icon: "🧮",
    description: "เรียนรู้การใช้ตัวดำเนินการทางคณิตศาสตร์",
    content: [
      {
        title: "การคำนวณใน Python",
        text: "Python สามารถใช้คำนวณทางคณิตศาสตร์ เช่น การบวก ลบ คูณ และหาร",
      },
      {
        title: "ตัวดำเนินการ",
        text: "ตัวดำเนินการที่ใช้บ่อย ได้แก่ +, -, *, / และ %",
      },
    ],
    example: `a = 10
b = 5

result = a + b
print(result)`,
    concept: "สามารถนำค่าที่เก็บในตัวแปรมาคำนวณร่วมกันได้",
  },

  {
    id: 4,
    title: "String",
    icon: "🔤",
    description: "เรียนรู้การทำงานกับข้อความ",
    content: [
      {
        title: "String คืออะไร?",
        text: "String คือข้อมูลประเภทข้อความ โดยสามารถเขียนข้อความไว้ภายในเครื่องหมายคำพูด",
      },
      {
        title: "การต่อข้อความ",
        text: "เราสามารถนำ String หลายตัวมาต่อกันเพื่อสร้างข้อความใหม่ได้",
      },
    ],
    example: `first_name = "Python"
last_name = "Developer"

full_name = first_name + " " + last_name

print(full_name)`,
    concept: "String ใช้สำหรับเก็บและจัดการข้อมูลประเภทข้อความ",
  },

  {
    id: 5,
    title: "List",
    icon: "📋",
    description: "เรียนรู้การเก็บข้อมูลหลายค่าใน List",
    content: [
      {
        title: "List คืออะไร?",
        text: "List ใช้สำหรับเก็บข้อมูลหลายค่าไว้ภายในตัวแปรเดียว โดยข้อมูลแต่ละตัวจะมีตำแหน่งหรือ Index",
      },
      {
        title: "Index",
        text: "Index ของ List เริ่มต้นจาก 0 ดังนั้นสมาชิกตัวแรกจะอยู่ที่ Index 0",
      },
    ],
    example: `fruits = ["apple", "banana", "orange"]

print(fruits[0])`,
    concept: "List ช่วยให้สามารถจัดเก็บข้อมูลหลายรายการไว้ในตัวแปรเดียว",
  },

  {
    id: 6,
    title: "Tuple",
    icon: "📦",
    description: "เรียนรู้การจัดเก็บข้อมูลแบบ Tuple",
    content: [
      {
        title: "Tuple คืออะไร?",
        text: "Tuple เป็นโครงสร้างข้อมูลที่สามารถเก็บข้อมูลหลายค่าได้คล้ายกับ List",
      },
      {
        title: "Index ของ Tuple",
        text: "Tuple สามารถเข้าถึงข้อมูลด้วย Index เช่นเดียวกับ List",
      },
    ],
    example: `numbers = (10, 20, 30)

print(numbers[1])`,
    concept: "Tuple เหมาะสำหรับข้อมูลหลายค่าที่ต้องการจัดเก็บเป็นชุดเดียว",
  },

  {
    id: 7,
    title: "เงื่อนไข If / Else",
    icon: "🔀",
    description: "เรียนรู้การให้โปรแกรมตัดสินใจ",
    content: [
      {
        title: "เงื่อนไขคืออะไร?",
        text: "คำสั่ง if ใช้ตรวจสอบเงื่อนไข และให้โปรแกรมเลือกว่าจะทำคำสั่งใดตามผลของเงื่อนไข",
      },
      {
        title: "if / else",
        text: "else ใช้สำหรับกำหนดการทำงานเมื่อเงื่อนไขของ if ไม่เป็นจริง",
      },
    ],
    example: `age = 20

if age >= 18:
    print("Adult")
else:
    print("Child")`,
    concept: "เงื่อนไขช่วยให้โปรแกรมสามารถตัดสินใจตามข้อมูลที่ได้รับ",
  },

  {
    id: 8,
    title: "For Loop",
    icon: "🔁",
    description: "เรียนรู้การทำงานซ้ำด้วย for",
    content: [
      {
        title: "Loop คืออะไร?",
        text: "Loop ใช้สำหรับสั่งให้โปรแกรมทำงานเดิมซ้ำหลายครั้ง",
      },
      {
        title: "For Loop",
        text: "for มักใช้เมื่อต้องการวนซ้ำตามจำนวนหรือสมาชิกของข้อมูลที่กำหนด",
      },
    ],
    example: `for i in range(1, 6):
    print(i)`,
    concept: "For Loop ช่วยลดการเขียนคำสั่งเดิมซ้ำหลายครั้ง",
  },

  {
    id: 9,
    title: "While Loop",
    icon: "🔄",
    description: "เรียนรู้การทำงานซ้ำด้วย while",
    content: [
      {
        title: "While คืออะไร?",
        text: "while ใช้สำหรับทำงานซ้ำตราบใดที่เงื่อนไขที่กำหนดยังเป็นจริง",
      },
      {
        title: "สิ่งที่ควรระวัง",
        text: "ควรตรวจสอบเงื่อนไขของ while ให้สามารถเปลี่ยนเป็นเท็จได้ เพื่อป้องกันการวนซ้ำไม่สิ้นสุด",
      },
    ],
    example: `i = 1

while i <= 5:
    print(i)
    i += 1`,
    concept: "While Loop ทำงานซ้ำโดยอาศัยเงื่อนไขเป็นตัวควบคุม",
  },

  {
    id: 10,
    title: "Function",
    icon: "⚙️",
    description: "เรียนรู้การสร้างฟังก์ชัน",
    content: [
      {
        title: "Function คืออะไร?",
        text: "Function คือชุดคำสั่งที่จัดกลุ่มไว้เพื่อทำงานบางอย่าง และสามารถเรียกใช้งานได้เมื่อจำเป็น",
      },
      {
        title: "การสร้าง Function",
        text: "ใน Python ใช้คำสั่ง def สำหรับสร้างฟังก์ชัน",
      },
    ],
    example: `def greet():
    print("Hello Python")

greet()`,
    concept: "Function ช่วยจัดระเบียบโค้ดและทำให้สามารถนำชุดคำสั่งกลับมาใช้งานได้",
  },
];

export default function LearningPage() {
  const [selectedLesson, setSelectedLesson] = useState(0);
  const navigate = useNavigate();

  const lesson = lessons[selectedLesson];

  const goToPractice = () => {
    navigate("/practice");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      {/* Header */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <Link
            to="/"
            className="text-sm text-slate-400 transition hover:text-green-400"
          >
            ← กลับหน้าหลัก
          </Link>

          <h1 className="mt-6 text-4xl font-bold md:text-5xl">
            Python{" "}
            <span className="text-green-400">
              Learning Center
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            เรียนรู้พื้นฐาน Python ทีละบท
            ทำความเข้าใจแนวคิดและดูตัวอย่างก่อนลงมือฝึกจริง
          </p>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

          {/* Lesson List */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">

              <h2 className="mb-4 px-2 text-lg font-semibold">
                📚 บทเรียน
              </h2>

              <div className="space-y-2">
                {lessons.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLesson(index)}
                    className={`w-full rounded-xl p-3 text-left transition ${
                      selectedLesson === index
                        ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/30"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">

                      <span className="text-xl">
                        {item.icon}
                      </span>

                      <div>
                        <p className="text-xs text-slate-500">
                          บทที่ {item.id}
                        </p>

                        <p className="text-sm font-medium">
                          {item.title}
                        </p>
                      </div>

                    </div>
                  </button>
                ))}
              </div>

            </div>
          </aside>

          {/* Lesson Content */}
          <section>

            {/* Lesson Title */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">

              <div className="flex flex-wrap items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-3xl">
                  {lesson.icon}
                </div>

                <div>
                  <p className="text-sm font-medium text-green-400">
                    บทที่ {lesson.id} / {lessons.length}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold md:text-3xl">
                    {lesson.title}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {lesson.description}
                  </p>
                </div>

              </div>

              {/* Progress */}
              <div className="mt-6">

                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>ความคืบหน้า</span>
                  <span>
                    {Math.round(
                      ((selectedLesson + 1) / lessons.length) * 100
                    )}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${((selectedLesson + 1) / lessons.length) * 100}%`,
                    }}
                  />
                </div>

              </div>

            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">

              {lesson.content.map((section, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <h3 className="text-xl font-semibold">
                    {section.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {section.text}
                  </p>
                </article>
              ))}

              {/* Example */}
              <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                <div className="border-b border-slate-800 px-6 py-4">
                  <h3 className="font-semibold">
                    💻 ตัวอย่างโค้ด
                  </h3>
                </div>

                <pre className="overflow-x-auto bg-black p-6 font-mono text-sm leading-7 text-green-400">
                  {lesson.example}
                </pre>

              </article>

              {/* Key Concept */}
              <article className="rounded-2xl border border-green-900/40 bg-green-950/20 p-6">

                <h3 className="font-semibold text-green-400">
                  💡 Key Concept
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {lesson.concept}
                </p>

              </article>

              {/* Navigation */}
              <div className="flex flex-wrap justify-between gap-3">

                <button
                  onClick={() =>
                    setSelectedLesson((prev) =>
                      Math.max(prev - 1, 0)
                    )
                  }
                  disabled={selectedLesson === 0}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← บทก่อนหน้า
                </button>

                {selectedLesson < lessons.length - 1 ? (
                  <button
                    onClick={() =>
                      setSelectedLesson((prev) =>
                        Math.min(prev + 1, lessons.length - 1)
                      )
                    }
                    className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-green-400"
                  >
                    บทถัดไป →
                  </button>
                ) : (
                  <button
                    onClick={goToPractice}
                    className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-green-400"
                  >
                    📚 ไปทำแบบฝึกหัด
                  </button>
                )}

              </div>

            </div>

          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Adaptive Python © 2026
      </footer>
    </div>
  );
}