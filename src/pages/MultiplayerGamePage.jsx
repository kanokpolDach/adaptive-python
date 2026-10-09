import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { socket } from "../socket";

function FootballField({ keeperX, shooterX, phase, shotNonce }) {
  const ballRef = useRef(null);
  const shotStartRef = useRef(0);
  const shotXRef = useRef(0);

  useEffect(() => {
    if (shotNonce > 0) {
      shotStartRef.current = Date.now();
      shotXRef.current = shooterX;
    }
  }, [shotNonce, shooterX]);

  useFrame(() => {
    if (!ballRef.current) return;

    if (shotStartRef.current) {
      const progress = Math.min((Date.now() - shotStartRef.current) / 720, 1);
      ballRef.current.position.set(
        shotXRef.current,
        0.28 + Math.sin(progress * Math.PI) * 2.0,
        3.75 - progress * 10.1
      );
      ballRef.current.rotation.x += 0.22;
      ballRef.current.rotation.z += 0.12;

      if (progress >= 1) {
        shotStartRef.current = 0;
        ballRef.current.position.set(shooterX, 0.28, 3.75);
        ballRef.current.rotation.set(0, 0, 0);
      }
    } else {
      ballRef.current.position.set(shooterX, 0.28, 3.75);
    }
  });

  return (
    <Canvas camera={{ position: [0, 9, 11], fov: 48 }} className="rounded-3xl">
      <ambientLight intensity={2} />
      <directionalLight position={[4, 10, 5]} intensity={3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[14, 20]} />
        <meshStandardMaterial color="#176b3a" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.33, 0]}>
        <planeGeometry args={[12.5, 18.5]} />
        <meshStandardMaterial color="#238b45" />
      </mesh>

      {[-7, -4, -1, 2, 5].map((z, index) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, z]}>
          <planeGeometry args={[12, 2.7]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#258448" : "#1c773d"} />
        </mesh>
      ))}

      {/* Penalty box and goal area markings */}
      <mesh position={[0, -0.27, -4.9]}>
        <boxGeometry args={[7.5, 0.025, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-3.75, -0.27, -5.8]}>
        <boxGeometry args={[0.04, 0.025, 2.0]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[3.75, -0.27, -5.8]}>
        <boxGeometry args={[0.04, 0.025, 2.0]} />
        <meshBasicMaterial color="white" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[12, 0.08]} />
        <meshBasicMaterial color="white" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -6]}>
        <planeGeometry args={[12, 0.08]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Goal */}
      <mesh position={[-3.2, 1.0, -7]}>
        <boxGeometry args={[0.12, 2, 0.12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[3.2, 1.0, -7]}>
        <boxGeometry args={[0.12, 2, 0.12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 2.0, -7]}>
        <boxGeometry args={[6.5, 0.12, 0.12]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Keeper */}
      <mesh position={[keeperX, 0.65, -6.25]}>
        <capsuleGeometry args={[0.38, 0.9, 6, 12]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[keeperX, 1.55, -6.25]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#f2c6a0" />
      </mesh>

      {/* Shooter */}
      <mesh position={[shooterX, 0.65, 4.7]}>
        <capsuleGeometry args={[0.4, 1, 6, 12]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[shooterX, 1.58, 4.7]}>
        <sphereGeometry args={[0.31, 20, 20]} />
        <meshStandardMaterial color="#f2c6a0" />
      </mesh>

      {/* Ball */}
      <mesh ref={ballRef} position={[shooterX, 0.28, 3.75]}>
        <sphereGeometry args={[0.23, 24, 24]} />
        <meshStandardMaterial color="white" roughness={0.45} />
      </mesh>

      {phase === "finished" && (
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[4, 0.1, 0.1]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      )}

      <OrbitControls enablePan={false} minDistance={8} maxDistance={18} />
    </Canvas>
  );
}

export default function MultiplayerGamePage() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("room") || "";

  const [connected, setConnected] = useState(socket.connected);
  const [game, setGame] = useState(null);
  const [code, setCode] = useState("");
  const [answerMessage, setAnswerMessage] = useState("");
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [shooting, setShooting] = useState(false);
  const [shotNonce, setShotNonce] = useState(0);
  const [aimX, setAimX] = useState(0);
  const [keeperX, setKeeperX] = useState(0);

  const myId = socket.id;
  const me = game?.players?.find((p) => p.id === myId);
  const shooter = game?.players?.find((p) => p.id === game?.shooterId);
  const keeper = game?.players?.find((p) => p.id === game?.keeperId);
  const isShooter = myId === game?.shooterId;
  const isKeeper = myId === game?.keeperId;
  const answerReady = Boolean(game?.answerReadyByPlayer?.[myId]);

  const scoreRows = useMemo(() => {
    return (game?.players || []).map((player) => ({
      ...player,
      score: game?.scores?.[player.id] ?? 0,
    }));
  }, [game]);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      if (roomCode) {
        socket.emit("football_get_state", { roomCode });
      }
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onState({ state }) {
      setGame(state);
      if (typeof state?.aimX === "number") setAimX(state.aimX);
      if (typeof state?.keeperX === "number") setKeeperX(state.keeperX);
    }

    function onKeeperMoved(data) {
      setKeeperX(Number(data.x) || 0);
    }

    function onAimChanged(data) {
      setAimX(Number(data.x) || 0);
    }

    function onAnswerResult(data) {
      setAnswerMessage(data.message || "");
      if (!data.correct) setError(data.errorInfo?.message || data.message || "คำตอบยังไม่ถูก");
      else setError("");
    }

    function onShotResult({ result, state }) {
      setGame(state);
      setShotNonce((value) => value + 1);
      setShooting(false);
      setResultMessage(result?.message || "");
      setAimX(state?.aimX ?? 0);
      setKeeperX(state?.keeperX ?? 0);

      if (result?.type === "goal") {
        setAnswerMessage("⚽ ยิงเข้า +1 คะแนน");
      } else if (result?.type === "save") {
        setAnswerMessage("🧤 ผู้รักษาประตูเซฟได้");
      }
    }

    function onFootballError(data) {
      setShooting(false);
      setError(data?.message || "เกิดข้อผิดพลาด");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("football_game_state", onState);
    socket.on("football_keeper_moved", onKeeperMoved);
    socket.on("football_aim_changed", onAimChanged);
    socket.on("football_answer_result", onAnswerResult);
    socket.on("football_shot_result", onShotResult);
    socket.on("football_error", onFootballError);

    if (socket.connected && roomCode) {
      socket.emit("football_get_state", { roomCode });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("football_game_state", onState);
      socket.off("football_keeper_moved", onKeeperMoved);
      socket.off("football_aim_changed", onAimChanged);
      socket.off("football_answer_result", onAnswerResult);
      socket.off("football_shot_result", onShotResult);
      socket.off("football_error", onFootballError);
    };
  }, [roomCode]);

  useEffect(() => {
    function onKeyDown(event) {
      if (!isKeeper) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -0.5 : 0.5;
      moveKeeper(direction);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isKeeper, keeperX]);

  function moveKeeper(delta) {
    if (!isKeeper || !roomCode) return;
    const next = Math.max(-3, Math.min(3, keeperX + delta));
    setKeeperX(next);
    socket.emit("football_move_keeper", { roomCode, x: next });
  }

  function changeAim(delta) {
    if (!isShooter || !roomCode) return;
    const next = Math.max(-3, Math.min(3, aimX + delta));
    setAimX(next);
    socket.emit("football_aim", { roomCode, x: next });
  }

  function submitAnswer() {
    if (!isShooter || !roomCode) return;
    setError("");
    setAnswerMessage("⏳ กำลังตรวจคำตอบ...");
    socket.emit("football_answer", { roomCode, code });
  }

  function shoot() {
    if (!isShooter || !answerReady || shooting || !roomCode) return;
    setShooting(true);
    setResultMessage("⚽ กำลังยิง...");
    socket.emit("football_shoot", { roomCode, x: aimX });
  }

  function resetForNextQuestion() {
    setCode("");
    setAnswerMessage("");
    setError("");
    setResultMessage("");
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-4xl font-black text-red-400">ไม่พบ Room Code</h1>
          <p className="mt-4 text-slate-400">กลับไปสร้างหรือเข้าห้อง Multiplayer ก่อน</p>
          <Link to="/football/multiplayer" className="mt-8 inline-block rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950">
            ← กลับ Multiplayer
          </Link>
        </main>
      </div>
    );
  }

  if (!game || game.phase === "waiting") {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-6xl">⚽</div>
            <h1 className="mt-5 text-3xl font-black text-green-400">กำลังเข้าสนาม...</h1>
            <p className="mt-3 text-slate-400">{game?.phase === "waiting" ? "รอให้เจ้าของห้องเริ่มการแข่งขัน" : "กำลังเชื่อมต่อเกม Multiplayer"}</p>
            <p className="mt-2 text-xs text-slate-500">{connected ? `Room: ${roomCode}` : "กำลังเชื่อมต่อ Server..."}</p>
            <button onClick={() => socket.emit("football_get_state", { roomCode })} className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">ตรวจสอบสถานะอีกครั้ง</button>
          </div>
        </main>
      </div>
    );
  }

  const winner = game.winnerId ? game.players.find((p) => p.id === game.winnerId) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-green-400">⚽ FOOTBALL CODING MULTIPLAYER</div>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">Penalty Coding Battle</h1>
            <p className="mt-1 text-sm text-slate-400">Room {roomCode} · เกม {game.phase === "sudden_death" ? "ต่อเวลา" : `${Math.min(game.round, 2)} / 2`}</p>
            <p className="mt-2 text-xs text-slate-500">{connected ? "🟢 เชื่อมต่อแบบ Real-time" : "🔴 กำลังเชื่อมต่อใหม่..."}</p>
          </div>

          <div className="flex gap-3">
            {scoreRows.map((player) => (
              <div key={player.id} className="min-w-32 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-center">
                <div className="truncate text-xs text-slate-400">{player.name}</div>
                <div className="text-3xl font-black text-green-400">{player.score}</div>
              </div>
            ))}
          </div>
        </div>

        {game.phase === "finished" && (
          <div className="mb-5 rounded-3xl border border-yellow-400/40 bg-yellow-400/10 p-6 text-center">
            <div className="text-6xl">🏆</div>
            <h2 className="mt-3 text-4xl font-black text-yellow-300">{winner?.name || game.winnerName || "ผู้ชนะ"} ชนะ!</h2>
            <p className="mt-2 text-slate-300">ทำคะแนนถึง 4 แต้มก่อน</p>
            <div className="mt-5 flex justify-center gap-3">
              {scoreRows.map((player) => (
                <div key={player.id} className="rounded-xl bg-slate-950 px-5 py-3 font-bold">
                  {player.name}: {player.score} คะแนน
                </div>
              ))}
            </div>
          </div>
        )}

        {game.phase === "sudden_death" && (
          <div className="mb-5 rounded-3xl border border-red-400/40 bg-red-400/10 p-5 text-center">
            <div className="text-3xl">🔥 SUDDEN DEATH</div>
            <p className="mt-1 text-slate-300">คะแนนเท่ากัน ใครยิงเข้าได้ก่อนชนะ!</p>
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-3 shadow-2xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-2">
              <div className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-300">
                ⚽ {shooter?.name || "Shooter"} → คนยิง
              </div>
              <div className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                🧤 {keeper?.name || "Keeper"} → ผู้รักษาประตู
              </div>
            </div>

            <div className="h-[440px] overflow-hidden rounded-2xl bg-slate-800">
              <FootballField keeperX={keeperX} shooterX={aimX} phase={game.phase} shotNonce={shotNonce} />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-center">
              <div className="text-xs text-slate-500">ลูกที่</div>
              <div className="text-2xl font-black text-white">
                {Math.min(game.attempt + 1, game.maxAttempts)} / {game.maxAttempts}
              </div>
              {resultMessage && <div className="mt-2 font-bold text-yellow-300">{resultMessage}</div>}
            </div>
          </div>

          <div className="space-y-5">
            {isKeeper && game.phase !== "finished" && (
              <section className="rounded-3xl border border-blue-500/30 bg-slate-900 p-5">
                <div className="text-sm font-bold text-blue-300">🧤 คุณเป็นผู้รักษาประตู</div>
                <p className="mt-2 text-sm text-slate-400">ขยับซ้าย–ขวาเพื่อปิดมุมยิงของคู่แข่ง ควบคุมด้วยปุ่มด้านล่างหรือปุ่มลูกศรบนคีย์บอร์ด</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button onClick={() => moveKeeper(-0.6)} className="rounded-xl bg-blue-500 px-4 py-4 text-2xl font-black hover:bg-blue-400">←</button>
                  <button onClick={() => moveKeeper(0.6)} className="rounded-xl bg-blue-500 px-4 py-4 text-2xl font-black hover:bg-blue-400">→</button>
                </div>
                <div className="mt-3 text-center text-xs text-slate-500">Keyboard: ← →</div>
              </section>
            )}

            {isShooter && game.phase !== "finished" && (
              <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-5">
                <div className="text-sm font-bold text-green-300">⚽ คุณเป็นคนยิง</div>
                <p className="mt-2 text-sm text-slate-400">ตอบโจทย์ Python ให้ถูกก่อน จากนั้นเลือกทิศทางและยิงประตู</p>
                <div className="mt-3 rounded-2xl bg-slate-950 p-4">
                  <div className="text-xs font-bold text-slate-500">PYTHON CHALLENGE</div>
                  <h2 className="mt-1 text-lg font-black">{game.question?.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{game.question?.prompt}</p>
                  <div className="mt-3 rounded-xl bg-slate-900 px-3 py-2 font-mono text-xs text-green-300">
                    Hint: {game.question?.hint}
                  </div>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={7}
                  spellCheck={false}
                  className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-white outline-none focus:border-green-400"
                  placeholder={'เขียน Python ของคุณที่นี่...'}
                />

                <button onClick={submitAnswer} className="mt-3 w-full rounded-xl bg-green-500 px-4 py-3 font-black text-slate-950 hover:bg-green-400">
                  🐍 ตรวจคำตอบ Python
                </button>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => changeAim(-1)} className="rounded-xl border border-slate-700 bg-slate-950 py-3 font-black hover:border-green-400">←</button>
                  <div className="flex items-center justify-center rounded-xl bg-slate-950 text-xs text-slate-400">Aim {aimX.toFixed(1)}</div>
                  <button onClick={() => changeAim(1)} className="rounded-xl border border-slate-700 bg-slate-950 py-3 font-black hover:border-green-400">→</button>
                </div>

                <button
                  onClick={shoot}
                  disabled={!answerReady || shooting || game.phase === "finished"}
                  className="mt-3 w-full rounded-xl bg-yellow-400 px-4 py-4 text-xl font-black text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {answerReady ? "⚽ ยิงเลย!" : "🔒 ตอบ Python ให้ถูกก่อน"}
                </button>
              </section>
            )}

            {!isShooter && !isKeeper && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center">
                <div className="text-4xl">⏳</div>
                <p className="mt-2 text-slate-300">กำลังรอผู้เล่น...</p>
              </section>
            )}

            {answerMessage && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                {answerMessage}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                ❌ {error}
              </div>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-xs font-bold text-slate-500">MATCH STATUS</div>
              <div className="mt-2 text-xl font-black">
                {game.phase === "playing" ? "🔥 กำลังแข่งขัน" : game.phase === "finished" ? "🏆 จบการแข่งขัน" : "⚡ Sudden Death"}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between"><span>เกม</span><span className="font-bold text-white">{Math.min(game.round, 2)} / 2</span></div>
                <div className="flex justify-between"><span>คนยิง</span><span className="font-bold text-green-300">{shooter?.name}</span></div>
                <div className="flex justify-between"><span>ผู้รักษาประตู</span><span className="font-bold text-blue-300">{keeper?.name}</span></div>
              </div>
            </section>

            <button onClick={resetForNextQuestion} className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-400 hover:border-slate-500 hover:text-white">
              รีเซ็ตช่องคำตอบ
            </button>
          </div>
        </section>

        <div className="mt-6 text-center">
          <Link to="/football/multiplayer" className="text-sm text-slate-500 hover:text-green-400">← กลับห้อง Multiplayer</Link>
        </div>
      </main>
    </div>
  );
}
