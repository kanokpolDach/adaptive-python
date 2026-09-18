import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import LearningPage from "./pages/LearningPage";
import PracticePage from "./pages/PracticePage";
import PlaygroundPage from "./pages/PlaygroundPage";
import ChallengePage from "./pages/ChallengePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Home
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =========================
            Learning
        ========================= */}

        <Route
          path="/learning"
          element={<LearningPage />}
        />

        {/* =========================
            Practice
        ========================= */}

        <Route
          path="/practice"
          element={<PracticePage />}
        />

        {/* =========================
            Playground
        ========================= */}

        <Route
          path="/playground"
          element={<PlaygroundPage />}
        />

        {/* =========================
            Challenge
        ========================= */}

        <Route
          path="/challenge"
          element={<ChallengePage />}
        />

        {/* =========================
            404
        ========================= */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

              <div className="text-center">

                <h1 className="text-7xl font-bold text-green-400">
                  404
                </h1>

                <p className="mt-4 text-slate-400">
                  ไม่พบหน้าที่ต้องการ
                </p>

                <a
                  href="/"
                  className="mt-6 inline-block rounded-xl bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400"
                >
                  ← กลับหน้าหลัก
                </a>

              </div>

            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}