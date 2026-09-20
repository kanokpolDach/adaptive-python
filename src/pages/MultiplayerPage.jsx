import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { socket } from "../socket";

export default function MultiplayerPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [roomCode, setRoomCode] = useState("");
  const [playerId, setPlayerId] = useState("");

  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("lobby");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [connected, setConnected] = useState(false);

  const [ready, setReady] = useState(false);

  // =====================================================
  // SOCKET CONNECTION
  // =====================================================

  useEffect(() => {
    function handleConnect() {
      console.log("Socket connected:", socket.id);

      setConnected(true);
      setPlayerId(socket.id);
      setError("");
    }

    function handleDisconnect() {
      console.log("Socket disconnected");

      setConnected(false);
    }

    // ===================================================
    // CREATE ROOM
    // ===================================================

    function handleRoomCreated(data) {
      if (!data.success) {
        setError(
          data?.message ||
            "ไม่สามารถสร้างห้องได้"
        );
        return;
      }

      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);

      updatePlayers(data.state);

      setStatus("waiting");

      setMessage(
        `สร้างห้องสำเร็จ! Room Code: ${data.roomCode}`
      );
    }

    // ===================================================
    // JOIN ROOM
    // ===================================================

    function handleRoomJoined(data) {
      if (!data.success) {
        setError(
          data?.message ||
            "ไม่สามารถเข้าห้องได้"
        );
        return;
      }

      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);

      updatePlayers(data.state);

      setStatus(data.state.status);

      setMessage(
        `เข้าห้อง ${data.roomCode} สำเร็จ`
      );
    }

    // ===================================================
    // PLAYER JOINED
    // ===================================================

    function handlePlayerJoined(data) {
      updatePlayers(data.state);

      setStatus(data.state.status);

      setMessage(
        "🎮 มีผู้เล่นเข้าห้องแล้ว!"
      );
    }

    // ===================================================
    // GAME STATE
    // ===================================================

    function handleGameState(data) {
      updatePlayers(data.state);

      setStatus(data.state.status);

      if (data.state.status === "playing") {
        setMessage(
          "🔥 ผู้เล่นพร้อมแล้ว! เริ่มเกม!"
        );
      }
    }

    // ===================================================
    // PLAYER LEFT
    // ===================================================

    function handlePlayerLeft(data) {
      updatePlayers(data.state);

      setStatus("waiting");

      setReady(false);

      setMessage(
        "ผู้เล่นอีกคนออกจากห้อง"
      );
    }

    // ===================================================
    // ERROR
    // ===================================================

    function handleRoomError(data) {
      setError(
        data?.message ||
          "เกิดข้อผิดพลาด"
      );
    }

    // ===================================================
    // REGISTER EVENTS
    // ===================================================

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "room_created",
      handleRoomCreated
    );

    socket.on(
      "room_joined",
      handleRoomJoined
    );

    socket.on(
      "player_joined",
      handlePlayerJoined
    );

    socket.on(
      "game_state",
      handleGameState
    );

    socket.on(
      "player_left",
      handlePlayerLeft
    );

    socket.on(
      "room_error",
      handleRoomError
    );

    // Socket อาจ connect ไปแล้วก่อน component mount
    if (socket.connected) {
      setConnected(true);
      setPlayerId(socket.id);
    }

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "room_created",
        handleRoomCreated
      );

      socket.off(
        "room_joined",
        handleRoomJoined
      );

      socket.off(
        "player_joined",
        handlePlayerJoined
      );

      socket.off(
        "game_state",
        handleGameState
      );

      socket.off(
        "player_left",
        handlePlayerLeft
      );

      socket.off(
        "room_error",
        handleRoomError
      );

      // สำคัญ:
      // ห้าม socket.disconnect() ตรงนี้
      // เพราะหน้า Game จะใช้ Socket connection เดิม
    };
  }, []);

  // =====================================================
  // UPDATE PLAYERS
  // =====================================================

  function updatePlayers(state) {
    if (!state) {
      setPlayers([]);
      return;
    }

    setPlayers(
      Array.isArray(state.players)
        ? state.players
        : []
    );
  }

  // =====================================================
  // CREATE ROOM
  // =====================================================

  function createRoom() {
    setError("");
    setMessage("");

    if (!connected) {
      setError(
        "ยังไม่ได้เชื่อมต่อ Multiplayer Server"
      );

      return;
    }

    const playerName =
      name.trim() || "Player 1";

    socket.emit(
      "create_room",
      {
        name: playerName,
      }
    );
  }

  // =====================================================
  // JOIN ROOM
  // =====================================================

  function joinRoom() {
    setError("");
    setMessage("");

    if (!connected) {
      setError(
        "ยังไม่ได้เชื่อมต่อ Multiplayer Server"
      );

      return;
    }

    const code =
      roomCodeInput
        .trim()
        .toUpperCase();

    if (!code) {
      setError(
        "กรุณาใส่ Room Code"
      );

      return;
    }

    const playerName =
      name.trim() || "Player 2";

    socket.emit(
      "join_room",
      {
        roomCode: code,
        name: playerName,
      }
    );
  }

  // =====================================================
  // READY
  // =====================================================

  function toggleReady() {
    if (!roomCode) {
      return;
    }

    if (!socket.connected) {
      setError(
        "Socket หลุดการเชื่อมต่อ"
      );

      return;
    }

    const nextReady = !ready;

    setReady(nextReady);

    socket.emit(
      "player_ready",
      {
        roomCode,
      }
    );

    if (nextReady) {
      setMessage(
        "🟢 พร้อมสำหรับการแข่งขัน"
      );
    } else {
      setMessage(
        "🟡 ยกเลิก Ready"
      );
    }
  }

  // =====================================================
  // START GAME
  // =====================================================

  function startGame() {
    setError("");

    if (players.length < 2) {
      setError(
        "ต้องมีผู้เล่น 2 คนก่อนเริ่มเกม"
      );

      return;
    }

    if (!ready) {
      setError(
        "กรุณากด Ready ก่อน"
      );

      return;
    }

    if (!socket.connected) {
      setError(
        "Socket หลุดการเชื่อมต่อ"
      );

      return;
    }

    navigate(
      `/football/multiplayer/game?room=${roomCode}`
    );
  }

  // =====================================================
  // COPY ROOM CODE
  // =====================================================

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(
        roomCode
      );

      setMessage(
        "📋 คัดลอก Room Code แล้ว"
      );
    } catch {
      setMessage(
        "Room Code: " + roomCode
      );
    }
  }

  // =====================================================
  // PLAYER COLORS
  // =====================================================

  function getPlayerClass(index) {
    if (index === 0) {
      return (
        "border-green-500 bg-green-500/10"
      );
    }

    return (
      "border-blue-500 bg-blue-500/10"
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8 text-center">

          <div className="mb-3 text-5xl">
            ⚽
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Football Coding
            <span className="text-green-400">
              {" "}Multiplayer
            </span>
          </h1>

          <p className="mt-3 text-slate-400">
            แข่งขันเขียน Python กับเพื่อนแบบ Realtime
          </p>

          {/* CONNECTION */}

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2">

            <span
              className={`h-3 w-3 rounded-full ${
                connected
                  ? "bg-green-400"
                  : "bg-red-500"
              }`}
            />

            <span className="text-sm">
              {connected
                ? "Multiplayer Server Connected"
                : "Connecting..."}
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* LOBBY */}
        {/* ================================================= */}

        {!roomCode && (

          <div className="grid gap-6 md:grid-cols-2">

            {/* ================================================= */}
            {/* CREATE ROOM */}
            {/* ================================================= */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

              <div className="mb-6 text-4xl">
                🎮
              </div>

              <h2 className="text-2xl font-bold">
                สร้างห้อง
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                สร้างห้องใหม่แล้วส่ง Room Code
                ให้เพื่อน
              </p>

              <label className="mt-6 block text-sm font-semibold text-slate-300">
                ชื่อผู้เล่น
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="เช่น Phattaradanai"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-green-400"
              />

              <button
                onClick={createRoom}
                disabled={!connected}
                className="mt-5 w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🎮 สร้างห้อง
              </button>

            </section>

            {/* ================================================= */}
            {/* JOIN ROOM */}
            {/* ================================================= */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

              <div className="mb-6 text-4xl">
                🚪
              </div>

              <h2 className="text-2xl font-bold">
                เข้าร่วมห้อง
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                ใส่ Room Code ที่เพื่อนส่งให้
              </p>

              <label className="mt-6 block text-sm font-semibold text-slate-300">
                ชื่อผู้เล่น
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="เช่น Player 2"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
              />

              <label className="mt-4 block text-sm font-semibold text-slate-300">
                Room Code
              </label>

              <input
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(
                    e.target.value.toUpperCase()
                  )
                }
                maxLength={6}
                placeholder="AB12CD"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-xl font-black tracking-[0.4em] uppercase outline-none transition focus:border-blue-400"
              />

              <button
                onClick={joinRoom}
                disabled={!connected}
                className="mt-5 w-full rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🚪 เข้าร่วมห้อง
              </button>

            </section>

          </div>

        )}

        {/* ================================================= */}
        {/* ROOM */}
        {/* ================================================= */}

        {roomCode && (

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">

            {/* ================================================= */}
            {/* ROOM HEADER */}
            {/* ================================================= */}

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm text-slate-400">
                  ROOM CODE
                </p>

                <button
                  onClick={copyRoomCode}
                  className="mt-1 text-4xl font-black tracking-[0.25em] text-green-400 transition hover:text-green-300"
                  title="คลิกเพื่อคัดลอก"
                >
                  {roomCode}
                </button>

                <p className="mt-2 text-xs text-slate-500">
                  คลิก Room Code เพื่อคัดลอก
                </p>

              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-center">

                <div className="text-xs text-slate-500">
                  STATUS
                </div>

                <div className="mt-1 font-bold text-green-400">
                  {status === "playing"
                    ? "🔥 PLAYING"
                    : "⏳ WAITING"}
                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* PLAYERS */}
            {/* ================================================= */}

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              {[0, 1].map((index) => {

                const player =
                  players[index];

                return (

                  <div
                    key={index}
                    className={`rounded-3xl border-2 p-6 ${getPlayerClass(
                      index
                    )}`}
                  >

                    <div className="flex items-center justify-between">

                      <div className="text-5xl">
                        {index === 0
                          ? "🟢"
                          : "🔵"}
                      </div>

                      <div className="text-right">

                        <div className="text-xs text-slate-500">
                          PLAYER {index + 1}
                        </div>

                        <div className="mt-1 text-xl font-black">
                          {player
                            ? player.name
                            : "Waiting..."}
                        </div>

                      </div>

                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">

                      <div className="flex justify-between text-sm">

                        <span className="text-slate-400">
                          Status
                        </span>

                        <span
                          className={
                            player?.ready
                              ? "font-bold text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          {player?.ready
                            ? "READY"
                            : "NOT READY"}
                        </span>

                      </div>

                      <div className="mt-3 flex justify-between text-sm">

                        <span className="text-slate-400">
                          Score
                        </span>

                        <span className="font-bold">
                          {player?.score ?? 0}
                        </span>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

            {/* ================================================= */}
            {/* WAITING */}
            {/* ================================================= */}

            {players.length < 2 && (

              <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-center">

                <div className="text-2xl">
                  ⏳
                </div>

                <p className="mt-2 font-semibold text-yellow-300">
                  กำลังรอผู้เล่นคนที่ 2
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  ส่ง Room Code
                  <span className="mx-2 font-black text-green-400">
                    {roomCode}
                  </span>
                  ให้เพื่อน
                </p>

              </div>

            )}

            {/* ================================================= */}
            {/* READY / START */}
            {/* ================================================= */}

            {players.length >= 2 && (

              <div className="mt-8 text-center">

                <button
                  onClick={toggleReady}
                  className={`rounded-xl px-8 py-3 font-black transition ${
                    ready
                      ? "bg-green-500 text-slate-950 hover:bg-green-400"
                      : "border border-green-500 text-green-400 hover:bg-green-500 hover:text-slate-950"
                  }`}
                >
                  {ready
                    ? "🟢 READY แล้ว"
                    : "⚡ READY"}
                </button>

                <button
                  onClick={startGame}
                  disabled={
                    players.length < 2 ||
                    !ready
                  }
                  className="ml-3 rounded-xl bg-white px-8 py-3 font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ⚽ เริ่มการแข่งขัน
                </button>

              </div>

            )}

            {/* ================================================= */}
            {/* MESSAGE */}
            {/* ================================================= */}

            {message && (

              <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-sm text-green-300">
                {message}
              </div>

            )}

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
                ❌ {error}
              </div>

            )}

          </section>

        )}

        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <div className="mt-8 text-center">

          <Link
            to="/football"
            className="text-sm text-slate-400 transition hover:text-green-400"
          >
            ← กลับ Football Coding Mission
          </Link>

        </div>

      </main>
    </div>
  );
}