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
import FootballMissionPage from "./pages/FootballMissionPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import MultiplayerGamePage from "./pages/MultiplayerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* HOME */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ========================= */}
        {/* LEARNING */}
        {/* ========================= */}

        <Route
          path="/learning"
          element={<LearningPage />}
        />

        {/* ========================= */}
        {/* PRACTICE */}
        {/* ========================= */}

        <Route
          path="/practice"
          element={<PracticePage />}
        />

        {/* ========================= */}
        {/* PLAYGROUND */}
        {/* ========================= */}

        <Route
          path="/playground"
          element={<PlaygroundPage />}
        />

        {/* ========================= */}
        {/* CHALLENGE */}
        {/* ========================= */}

        <Route
          path="/challenge"
          element={<ChallengePage />}
        />

        {/* ========================= */}
        {/* FOOTBALL CODING */}
        {/* ========================= */}

        <Route
          path="/football"
          element={<FootballMissionPage />}
        />

        {/* ========================= */}
        {/* FOOTBALL MULTIPLAYER LOBBY */}
        {/* ========================= */}

        <Route
          path="/football/multiplayer"
          element={<MultiplayerPage />}
        />

        {/* ========================= */}
        {/* FOOTBALL MULTIPLAYER GAME */}
        {/* ========================= */}

        <Route
          path="/football/multiplayer/game"
          element={<MultiplayerGamePage />}
        />

        {/* ========================= */}
        {/* 404 */}
        {/* ========================= */}

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