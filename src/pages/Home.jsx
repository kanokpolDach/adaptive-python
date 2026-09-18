import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Header />

      <main>

        {/* ==================================================
            Hero
        ================================================== */}

        <section className="relative overflow-hidden">

          <div className="absolute inset-0 bg-gradient-to-br from-green-950/40 via-slate-950 to-slate-950" />

          <div className="relative mx-auto max-w-7xl px-6 py-24">

            <div className="mx-auto max-w-4xl text-center">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-900 bg-green-950/40 px-5 py-2 text-sm text-green-300">
                🐍 Adaptive Learning Platform
              </div>

              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">

                Learn Python

                <span className="block text-green-400">
                  Your Way
                </span>

              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                แพลตฟอร์มสำหรับเรียนรู้ Python
                ตั้งแต่พื้นฐาน เรียนรู้ผ่านเนื้อหา
                ฝึกทำแบบฝึกหัด ทดลองเขียน Code
                และท้าทายความสามารถด้วย Code Challenge
              </p>


              {/* Buttons */}

              <div className="mt-10 flex flex-wrap justify-center gap-4">

                <Link
                  to="/learning"
                  className="rounded-xl bg-green-500 px-7 py-4 font-bold text-slate-950 transition hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20"
                >
                  📖 เริ่มเรียน Python
                </Link>

                <Link
                  to="/practice"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-7 py-4 font-bold text-white transition hover:border-green-500 hover:bg-slate-800"
                >
                  📚 ฝึกทำแบบฝึกหัด
                </Link>

                <Link
                  to="/challenge"
                  className="rounded-xl border border-yellow-600/50 bg-yellow-950/20 px-7 py-4 font-bold text-yellow-300 transition hover:border-yellow-400 hover:bg-yellow-900/30"
                >
                  🧪 Code Challenge
                </Link>

                <Link
                  to="/playground"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-7 py-4 font-bold text-white transition hover:border-green-500 hover:bg-slate-800"
                >
                  💻 ทดลองเขียน Python
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            Features
        ================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-16">

          <div className="mb-10 text-center">

            <div className="text-sm font-semibold text-green-400">
              LEARNING FEATURES
            </div>

            <h2 className="mt-2 text-3xl font-bold">
              เรียนรู้ Python อย่างเป็นขั้นตอน
            </h2>

            <p className="mt-3 text-slate-400">
              เรียนรู้ → ฝึกฝน → ท้าทาย → ทดลองเขียนด้วยตัวเอง
            </p>

          </div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">


            {/* Learning */}

            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-green-900">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-950 text-3xl">
                📖
              </div>

              <h3 className="text-xl font-bold">
                Learning Center
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                เรียนรู้เนื้อหา Python
                ตั้งแต่พื้นฐาน ตัวแปร เงื่อนไข Loop
                และ Function พร้อมตัวอย่าง Code
              </p>

              <Link
                to="/learning"
                className="mt-6 inline-block font-semibold text-green-400 hover:text-green-300"
              >
                เริ่มเรียน →
              </Link>

            </div>


            {/* Practice */}

            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-blue-900">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950 text-3xl">
                📚
              </div>

              <h3 className="text-xl font-bold">
                Practice
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                ฝึกเขียน Python ผ่านแบบฝึกหัด
                จำนวน 10 ข้อ พร้อมระบบตรวจคำตอบ
                และสะสม XP
              </p>

              <Link
                to="/practice"
                className="mt-6 inline-block font-semibold text-blue-400 hover:text-blue-300"
              >
                เริ่มฝึก →
              </Link>

            </div>


            {/* Code Challenge */}

            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-yellow-700">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-950 text-3xl">
                🧪
              </div>

              <h3 className="text-xl font-bold">
                Code Challenge
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                ท้าทายความสามารถด้วยโจทย์ Python
                ให้ผู้เรียนคิดและเขียนโปรแกรม
                ด้วยตัวเอง
              </p>

              <Link
                to="/challenge"
                className="mt-6 inline-block font-semibold text-yellow-400 hover:text-yellow-300"
              >
                เริ่ม Challenge →
              </Link>

            </div>


            {/* Playground */}

            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-purple-900">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950 text-3xl">
                💻
              </div>

              <h3 className="text-xl font-bold">
                Python Playground
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                เขียน Python ได้อย่างอิสระ
                ทดลอง Run Code และดูผลลัพธ์
                พร้อมระบบช่วยวิเคราะห์ Error
              </p>

              <Link
                to="/playground"
                className="mt-6 inline-block font-semibold text-purple-400 hover:text-purple-300"
              >
                เปิด Playground →
              </Link>

            </div>

          </div>

        </section>


        {/* ==================================================
            Learning Journey
        ================================================== */}

        <section className="border-y border-slate-800 bg-slate-900/40">

          <div className="mx-auto max-w-7xl px-6 py-16">

            <div className="mb-12 text-center">

              <div className="text-sm font-semibold text-green-400">
                LEARNING JOURNEY
              </div>

              <h2 className="mt-2 text-3xl font-bold">
                เส้นทางการเรียนรู้ Python
              </h2>

              <p className="mt-3 text-slate-400">
                เรียนรู้และพัฒนาทักษะทีละขั้น
              </p>

            </div>


            <div className="grid gap-8 md:grid-cols-4">


              {/* Step 1 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-black text-slate-950">
                  1
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  เรียนรู้
                </h3>

                <p className="mt-2 leading-6 text-slate-400">
                  ศึกษาเนื้อหา Python
                  และทำความเข้าใจแนวคิด
                </p>

              </div>


              {/* Step 2 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-black text-slate-950">
                  2
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  ฝึกฝน
                </h3>

                <p className="mt-2 leading-6 text-slate-400">
                  นำความรู้ไปใช้กับ
                  แบบฝึกหัด Python
                </p>

              </div>


              {/* Step 3 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-2xl font-black text-slate-950">
                  3
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  ท้าทาย
                </h3>

                <p className="mt-2 leading-6 text-slate-400">
                  ทดสอบความเข้าใจด้วย
                  Code Challenge
                </p>

              </div>


              {/* Step 4 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-2xl font-black text-slate-950">
                  4
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  ทดลอง
                </h3>

                <p className="mt-2 leading-6 text-slate-400">
                  ทดลองเขียน Code
                  ใน Python Playground
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            Code Challenge Preview
        ================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-16">

          <div className="overflow-hidden rounded-3xl border border-yellow-900/50 bg-gradient-to-br from-yellow-950/40 via-slate-900 to-slate-900 p-8 md:p-12">

            <div className="grid items-center gap-10 md:grid-cols-2">

              <div>

                <div className="inline-flex rounded-full border border-yellow-800 bg-yellow-950/50 px-4 py-2 text-sm text-yellow-300">
                  🧪 Code Challenge
                </div>

                <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                  พร้อมท้าทายความสามารถหรือยัง?
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  หลังจากเรียนรู้และฝึกฝนแล้ว
                  ลองนำความรู้มาสร้างโปรแกรมด้วยตัวเอง
                  ผ่านโจทย์ที่มีระดับความยากเพิ่มขึ้น
                </p>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    โจทย์ Python หลายระดับ
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    เขียน Code ด้วยตัวเอง
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    มีระบบตรวจผลลัพธ์
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    มี Hint โดยไม่เฉลยคำตอบ
                  </div>

                </div>

                <Link
                  to="/challenge"
                  className="mt-8 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-yellow-400"
                >
                  🧪 เริ่ม Code Challenge →
                </Link>

              </div>


              {/* Challenge Preview */}

              <div className="rounded-2xl border border-slate-800 bg-black p-6">

                <div className="mb-5 flex items-center gap-2">

                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />

                  <span className="ml-2 text-xs text-slate-500">
                    Code Challenge
                  </span>

                </div>

                <div className="font-mono text-sm">

                  <p className="text-yellow-400">
                    Challenge 1
                  </p>

                  <p className="mt-3 text-slate-300">
                    ตรวจสอบอายุ
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-900 p-4">

                    <p className="text-green-400">
                      🎯 Task
                    </p>

                    <p className="mt-2 leading-6 text-slate-400">
                      ถ้าอายุ 18 ปีขึ้นไป
                      ให้แสดง Adult
                    </p>

                  </div>

                  <div className="mt-4 rounded-lg bg-slate-900 p-4">

                    <p className="text-yellow-300">
                      💡 Hint
                    </p>

                    <p className="mt-2 leading-6 text-slate-400">
                      ลองใช้ if / else
                      เพื่อตรวจสอบเงื่อนไข
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            Smart Learning
        ================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-16">

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">

            <div className="grid items-center gap-10 md:grid-cols-2">


              <div>

                <div className="inline-flex rounded-full bg-yellow-950/50 px-4 py-2 text-sm text-yellow-300">
                  💡 Smart Learning
                </div>

                <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                  เรียนรู้จากข้อผิดพลาด
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  เมื่อเกิดข้อผิดพลาดใน Code
                  ระบบจะช่วยวิเคราะห์ประเภทของ Error
                  และให้คำใบ้เพื่อช่วยให้ผู้เรียน
                  ค้นหาสาเหตุและแก้ไขด้วยตัวเอง
                </p>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    วิเคราะห์ประเภทของ Error
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    แสดงตำแหน่งที่เกิดปัญหา
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    ให้คำใบ้เพื่อช่วยคิด
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    ไม่เฉลยคำตอบโดยตรง
                  </div>

                </div>

                <Link
                  to="/playground"
                  className="mt-8 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-yellow-400"
                >
                  ทดลองเขียน Code →
                </Link>

              </div>


              {/* Example Error Card */}

              <div className="rounded-2xl border border-slate-800 bg-black p-6">

                <div className="mb-5 flex items-center gap-2">

                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />

                  <span className="ml-2 text-xs text-slate-500">
                    Python Error
                  </span>

                </div>

                <div className="font-mono text-sm">

                  <p className="text-red-400">
                    NameError
                  </p>

                  <p className="mt-3 text-slate-400">
                    Line 3
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-900 p-4">

                    <p className="text-yellow-300">
                      💡 Hint
                    </p>

                    <p className="mt-2 leading-6 text-slate-400">
                      ลองตรวจสอบชื่อที่ถูกนำมาใช้งาน
                      ว่าตรงกับชื่อที่ประกาศไว้ก่อนหน้านี้หรือไม่
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            CTA
        ================================================== */}

        <section className="mx-auto max-w-5xl px-6 py-20">

          <div className="overflow-hidden rounded-3xl border border-green-900 bg-gradient-to-br from-green-950 to-slate-900 p-10 text-center sm:p-16">

            <div className="text-5xl">
              🐍
            </div>

            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              พร้อมเริ่มเรียน Python หรือยัง?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              เริ่มจากการเรียนรู้พื้นฐาน
              ทำความเข้าใจผ่านบทเรียน
              ฝึกทำแบบฝึกหัด
              และท้าทายตัวเองด้วย Code Challenge
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <Link
                to="/learning"
                className="rounded-xl bg-green-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-green-400"
              >
                📖 เริ่มเรียน
              </Link>

              <Link
                to="/practice"
                className="rounded-xl border border-slate-700 px-7 py-3 font-bold transition hover:bg-slate-800"
              >
                📚 Practice
              </Link>

              <Link
                to="/challenge"
                className="rounded-xl border border-yellow-700 px-7 py-3 font-bold text-yellow-300 transition hover:bg-yellow-950/40"
              >
                🧪 Challenge
              </Link>

              <Link
                to="/playground"
                className="rounded-xl border border-slate-700 px-7 py-3 font-bold transition hover:bg-slate-800"
              >
                💻 Playground
              </Link>

            </div>

          </div>

        </section>

      </main>


      {/* ==================================================
          Footer
      ================================================== */}

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © 2026 Adaptive Python
      </footer>

    </div>
  );
}