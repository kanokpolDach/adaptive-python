import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// =====================================================
// SOCKET SERVER
// =====================================================
// ถ้า Backend อยู่ Render ให้ใช้ URL นี้
// ถ้าทดสอบ Local ให้เปลี่ยนเป็น http://127.0.0.1:5000
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://adaptive-python.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

// =====================================================
// COMPONENT
// =====================================================

export default function MultiplayerPage() {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [name, setName] = useState("");

  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [roomCode, setRoomCode] = useState("");

  const [playerId, setPlayerId] = useState("");

  const [ownerId, setOwnerId] = useState("");

  const [players, setPlayers] = useState([]);

  const [status, setStatus] = useState("lobby");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [connected, setConnected] = useState(false);

  const [ready, setReady] = useState(false);

  const [loading, setLoading] = useState(false);

  // ===================================================
  // SOCKET CONNECTION
  // ===================================================

  useEffect(() => {
    function handleConnect() {
      console.log("Socket connected:", socket.id);

      setConnected(true);
      setPlayerId(socket.id);
      setError("");
    }

    function handleDisconnect(reason) {
      console.log("Socket disconnected:", reason);

      setConnected(false);

      setMessage("🔴 การเชื่อมต่อกับเซิร์ฟเวอร์หลุด");
    }

    function handleConnectError(err) {
      console.error("Socket connection error:", err);

      setConnected(false);

      setError(
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบ Backend / Render"
      );
    }

    // ===============================================
    // ROOM CREATED
    // ===============================================

    function handleRoomCreated(data) {
      console.log("room_created:", data);

      setLoading(false);

      if (!data) {
        setError("ไม่ได้รับข้อมูลห้องจากเซิร์ฟเวอร์");
        return;
      }

      const code = data.roomCode || data.room || "";

      if (!code) {
        setError("เซิร์ฟเวอร์ไม่ได้ส่ง Room Code กลับมา");
        return;
      }

      setRoomCode(code);

      setOwnerId(
        data.ownerId ||
          data.hostId ||
          data.creatorId ||
          socket.id
      );

      setStatus("room");

      setMessage(`สร้างห้อง ${code} สำเร็จ`);

      setError("");

      if (Array.isArray(data.players)) {
        updatePlayers(data);
      }
    }

    // ===============================================
    // ROOM JOINED
    // ===============================================

    function handleRoomJoined(data) {
      console.log("room_joined:", data);

      setLoading(false);

      if (!data) {
        setError("ไม่ได้รับข้อมูลห้องจากเซิร์ฟเวอร์");
        return;
      }

      const code = data.roomCode || data.room || roomCodeInput;

      setRoomCode(code);

      setOwnerId(
        data.ownerId ||
          data.hostId ||
          data.creatorId ||
          ""
      );

      setStatus("room");

      setMessage(`เข้าห้อง ${code} สำเร็จ`);

      setError("");

      if (Array.isArray(data.players)) {
        updatePlayers(data);
      }
    }

    // ===============================================
    // PLAYER JOINED
    // ===============================================

    function handlePlayerJoined(data) {
      console.log("player_joined:", data);

      if (!data) return;

      updatePlayers(data);

      if (data.player) {
        setMessage(
          `👤 ${data.player.name || "ผู้เล่นใหม่"} เข้าร่วมห้องแล้ว`
        );
      }
    }

    // ===============================================
    // PLAYERS UPDATE
    // ===============================================

    function handlePlayersUpdate(data) {
      console.log("players_update:", data);

      updatePlayers(data);
    }

    // ===============================================
    // PLAYER READY
    // ===============================================

    function handlePlayerReady(data) {
      console.log("player_ready:", data);

      updatePlayers(data);

      if (data?.message) {
        setMessage(data.message);
      }
    }

    // ===============================================
    // GAME STATE
    // ===============================================

    function handleGameState(data) {
      console.log("game_state:", data);

      if (!data) return;

      if (data.players) {
        updatePlayers(data);
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.roomCode) {
        setRoomCode(data.roomCode);
      }

      if (data.message) {
        setMessage(data.message);
      }
    }

    // ===============================================
    // START GAME RESULT
    // ===============================================

    function handleStartGameResult(data) {
      console.log("start_game_result:", data);

      setLoading(false);

      if (!data?.success) {
        setError(
          data?.message ||
            "ไม่สามารถเริ่มการแข่งขันได้"
        );

        return;
      }

      const nextRoomCode =
        data.roomCode ||
        data.room ||
        roomCode ||
        roomCodeInput;

      setMessage("🔥 เริ่มการแข่งขันแล้ว!");

      setStatus("playing");

      // รอเล็กน้อยเพื่อให้ Server sync ก่อนเปลี่ยนหน้า
      setTimeout(() => {
        navigate(
          `/football/multiplayer/game?room=${encodeURIComponent(
            nextRoomCode
          )}`
        );
      }, 300);
    }

    // ===============================================
    // GAME STARTED
    // ===============================================

    function handleGameStarted(data) {
      console.log("game_started:", data);

      const nextRoomCode =
        data?.roomCode ||
        data?.room ||
        roomCode;

      setStatus("playing");

      setMessage("🔥 เริ่มการแข่งขันแล้ว!");

      if (nextRoomCode) {
        setTimeout(() => {
          navigate(
            `/football/multiplayer/game?room=${encodeURIComponent(
              nextRoomCode
            )}`
          );
        }, 300);
      }
    }

    // ===============================================
    // ERROR
    // ===============================================

    function handleServerError(data) {
      console.error("server_error:", data);

      setLoading(false);

      setError(
        data?.message ||
          data?.error ||
          "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"
      );
    }

    // ===============================================
    // PLAYER LEFT
    // ===============================================

    function handlePlayerLeft(data) {
      console.log("player_left:", data);

      updatePlayers(data);

      setMessage("👋 ผู้เล่นออกจากห้องแล้ว");
    }

    // ===============================================
    // ROOM ERROR
    // ===============================================

    function handleRoomError(data) {
      console.error("room_error:", data);

      setLoading(false);

      setError(
        data?.message ||
          data?.error ||
          "ไม่สามารถเข้าห้องได้"
      );
    }

    // ===============================================
    // REGISTER EVENTS
    // ===============================================

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("connect_error", handleConnectError);

    socket.on("room_created", handleRoomCreated);

    socket.on("room_joined", handleRoomJoined);

    socket.on("player_joined", handlePlayerJoined);

    socket.on("players_update", handlePlayersUpdate);

    socket.on("player_ready", handlePlayerReady);

    socket.on("game_state", handleGameState);

    socket.on(
      "start_game_result",
      handleStartGameResult
    );

    socket.on(
      "game_started",
      handleGameStarted
    );

    socket.on("error", handleServerError);

    socket.on("server_error", handleServerError);

    socket.on("room_error", handleRoomError);

    socket.on("player_left", handlePlayerLeft);

    // ===============================================
    // CLEANUP
    // ===============================================

    return () => {
      socket.off("connect", handleConnect);

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
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
        "players_update",
        handlePlayersUpdate
      );

      socket.off(
        "player_ready",
        handlePlayerReady
      );

      socket.off(
        "game_state",
        handleGameState
      );

      socket.off(
        "start_game_result",
        handleStartGameResult
      );

      socket.off(
        "game_started",
        handleGameStarted
      );

      socket.off(
        "error",
        handleServerError
      );

      socket.off(
        "server_error",
        handleServerError
      );

      socket.off(
        "room_error",
        handleRoomError
      );

      socket.off(
        "player_left",
        handlePlayerLeft
      );
    };
  }, [navigate, roomCode, roomCodeInput]);

  // ===================================================
  // UPDATE PLAYERS
  // ===================================================

  function updatePlayers(data) {
    if (!data) {
      setPlayers([]);
      setOwnerId("");
      setReady(false);
      return;
    }

    const nextPlayers = Array.isArray(data.players)
      ? data.players
      : [];

    setPlayers(nextPlayers);

    if (
      data.ownerId ||
      data.hostId ||
      data.creatorId
    ) {
      setOwnerId(
        data.ownerId ||
          data.hostId ||
          data.creatorId
      );
    }

    // -----------------------------------------------
    // Find current player
    // -----------------------------------------------

    const me = nextPlayers.find(
      (player) =>
        player.id === socket.id ||
        player.socketId === socket.id
    );

    if (me) {
      setReady(Boolean(me.ready));
    }

    // -----------------------------------------------
    // ถ้า Server ส่ง ownerId มา
    // -----------------------------------------------

    if (data.ownerId === socket.id) {
      setOwnerId(socket.id);
    }
  }

  // ===================================================
  // CREATE ROOM
  // ===================================================

  function createRoom() {
    setError("");
    setMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("กรุณากรอกชื่อผู้เล่น");
      return;
    }

    if (!socket.connected) {
      setError(
        "Socket ยังไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์"
      );
      return;
    }

    setLoading(true);

    socket.emit("create_room", {
      name: trimmedName,
    });
  }

  // ===================================================
  // JOIN ROOM
  // ===================================================

  function joinRoom() {
    setError("");
    setMessage("");

    const trimmedName = name.trim();

    const code = roomCodeInput
      .trim()
      .toUpperCase();

    if (!trimmedName) {
      setError("กรุณากรอกชื่อผู้เล่น");
      return;
    }

    if (!code) {
      setError("กรุณากรอก Room Code");
      return;
    }

    if (!socket.connected) {
      setError(
        "Socket ยังไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์"
      );
      return;
    }

    setLoading(true);

    socket.emit("join_room", {
      roomCode: code,
      name: trimmedName,
    });
  }

  // ===================================================
  // READY
  // ===================================================

  function toggleReady() {
    setError("");

    if (!roomCode) {
      setError("ยังไม่มี Room Code");
      return;
    }

    if (!socket.connected) {
      setError(
        "Socket หลุดการเชื่อมต่อ"
      );
      return;
    }

    const me = players.find(
      (player) =>
        player.id === socket.id ||
        player.socketId === socket.id
    );

    const currentReady =
      me?.ready ?? ready;

    const nextReady = !currentReady;

    // -----------------------------------------------
    // ส่งสถานะ READY ไป Server
    // -----------------------------------------------

    socket.emit("player_ready", {
      roomCode,
      ready: nextReady,
    });

    // -----------------------------------------------
    // อัปเดต UI ทันที
    // -----------------------------------------------

    setReady(nextReady);

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        const isMe =
          player.id === socket.id ||
          player.socketId === socket.id;

        if (!isMe) return player;

        return {
          ...player,
          ready: nextReady,
        };
      })
    );

    if (nextReady) {
      setMessage(
        "🟢 คุณพร้อมสำหรับการแข่งขันแล้ว"
      );
    } else {
      setMessage(
        "🟡 ยกเลิก READY แล้ว"
      );
    }
  }

  // ===================================================
  // START GAME
  // ===================================================

  function startGame() {
    setError("");

    // -----------------------------------------------
    // Connection check
    // -----------------------------------------------

    if (!socket.connected) {
      setError(
        "Socket หลุดการเชื่อมต่อ"
      );
      return;
    }

    // -----------------------------------------------
    // Player count
    // -----------------------------------------------

    if (players.length !== 2) {
      setError(
        "ต้องมีผู้เล่นครบ 2 คนก่อนเริ่มเกม"
      );
      return;
    }

    // -----------------------------------------------
    // READY check
    // -----------------------------------------------

    const allReady = players.every(
      (player) => Boolean(player.ready)
    );

    if (!allReady) {
      setError(
        "ผู้เล่นทั้ง 2 คนต้องกด READY ก่อน"
      );
      return;
    }

    // -----------------------------------------------
    // Owner check
    // -----------------------------------------------
    //
    // สำคัญ:
    // เราจะไม่ซ่อนปุ่มด้วย ownerId อีกแล้ว
    // แต่ให้ปุ่มแสดงขึ้นมาเสมอเมื่อพร้อม
    //
    // แล้วให้ Server เป็นคนตรวจสอบว่าใครมีสิทธิ์
    // เริ่มเกม
    //
    // แบบนี้แก้ปัญหา ownerId ไม่ตรง socket.id
    // แล้วปุ่มหาย
    // -----------------------------------------------

    setLoading(true);

    setMessage(
      "⏳ กำลังเริ่มการแข่งขัน..."
    );

    socket.emit("start_game", {
      roomCode,
    });
  }

  // ===================================================
  // COPY ROOM CODE
  // ===================================================

  async function copyRoomCode() {
    if (!roomCode) return;

    try {
      await navigator.clipboard.writeText(
        roomCode
      );

      setMessage(
        "📋 คัดลอก Room Code แล้ว"
      );
    } catch (err) {
      console.error(err);

      setError(
        "ไม่สามารถคัดลอก Room Code ได้"
      );
    }
  }

  // ===================================================
  // LEAVE ROOM
  // ===================================================

  function leaveRoom() {
    if (socket.connected && roomCode) {
      socket.emit("leave_room", {
        roomCode,
      });
    }

    setRoomCode("");

    setRoomCodeInput("");

    setPlayers([]);

    setOwnerId("");

    setReady(false);

    setStatus("lobby");

    setMessage("");

    setError("");
  }

  // ===================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 text-center">

          <div className="mb-3 text-5xl">
            ⚽
          </div>

          <h1 className="text-4xl font-black tracking-tight">
            Multiplayer Football
          </h1>

          <p className="mt-2 text-slate-400">
            เล่นกับเพื่อนแบบ Real-time
          </p>

          {/* Connection Status */}

          <div className="mt-4 flex justify-center">

            <div
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                connected
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {connected
                ? "🟢 Connected"
                : "🔴 Disconnected"}
            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-semibold text-red-300">
            ❌ {error}
          </div>
        )}

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && !error && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center text-sm font-semibold text-green-300">
            {message}
          </div>
        )}

        {/* =================================================
            LOBBY
        ================================================= */}

        {status === "lobby" && (
          <div className="grid gap-6 md:grid-cols-2">

            {/* ===============================
                CREATE ROOM
            =============================== */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <div className="mb-5">

                <div className="mb-2 text-3xl">
                  👑
                </div>

                <h2 className="text-2xl font-black">
                  สร้างห้อง
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  สร้างห้องใหม่แล้วชวนเพื่อนเข้ามา
                </p>

              </div>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                ชื่อผู้เล่น
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="เช่น Player 1"
                maxLength={30}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-green-500"
              />

              <button
                onClick={createRoom}
                disabled={loading || !connected}
                className="w-full rounded-xl bg-green-500 px-5 py-3 font-black text-slate-950 transition hover:scale-[1.02] hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "⏳ กำลังสร้างห้อง..."
                  : "👑 สร้างห้อง"}
              </button>

            </div>

            {/* ===============================
                JOIN ROOM
            =============================== */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <div className="mb-5">

                <div className="mb-2 text-3xl">
                  🚪
                </div>

                <h2 className="text-2xl font-black">
                  เข้าร่วมห้อง
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  ใส่ Room Code จากเพื่อน
                </p>

              </div>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                ชื่อผู้เล่น
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="เช่น Player 2"
                maxLength={30}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-green-500"
              />

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Room Code
              </label>

              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(
                    e.target.value.toUpperCase()
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    joinRoom();
                  }
                }}
                placeholder="เช่น P492F9"
                maxLength={10}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg uppercase tracking-widest text-white outline-none transition placeholder:text-slate-600 focus:border-green-500"
              />

              <button
                onClick={joinRoom}
                disabled={loading || !connected}
                className="w-full rounded-xl border border-green-500 px-5 py-3 font-black text-green-400 transition hover:bg-green-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "⏳ กำลังเข้าห้อง..."
                  : "🚪 เข้าร่วมห้อง"}
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            ROOM
        ================================================= */}

        {status === "room" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            {/* ============================================
                ROOM HEADER
            ============================================ */}

            <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row">

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Room Code
                </p>

                <div className="mt-1 flex items-center gap-3">

                  <h2 className="font-mono text-4xl font-black tracking-[0.15em] text-green-400">
                    {roomCode}
                  </h2>

                  <button
                    onClick={copyRoomCode}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-green-500 hover:text-green-400"
                  >
                    📋
                  </button>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  แชร์รหัสนี้ให้เพื่อนเพื่อเข้าห้อง
                </p>

              </div>

              <div className="text-center md:text-right">

                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-lg font-black text-green-400">
                  WAITING
                </p>

              </div>

            </div>

            {/* ============================================
                PLAYERS
            ============================================ */}

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-xl font-black">
                  👥 ผู้เล่น
                </h3>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-slate-300">
                  {players.length} / 2
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {/* ======================================
                    PLAYER SLOT 1
                ====================================== */}

                {players[0] ? (
                  <PlayerCard
                    player={players[0]}
                    isMe={
                      players[0].id === socket.id ||
                      players[0].socketId === socket.id
                    }
                    isOwner={
                      players[0].id === ownerId ||
                      players[0].socketId === ownerId
                    }
                  />
                ) : (
                  <EmptyPlayerSlot number={1} />
                )}

                {/* ======================================
                    PLAYER SLOT 2
                ====================================== */}

                {players[1] ? (
                  <PlayerCard
                    player={players[1]}
                    isMe={
                      players[1].id === socket.id ||
                      players[1].socketId === socket.id
                    }
                    isOwner={
                      players[1].id === ownerId ||
                      players[1].socketId === ownerId
                    }
                  />
                ) : (
                  <EmptyPlayerSlot number={2} />
                )}

              </div>

            </div>

            {/* ============================================
                READY / START
            ============================================ */}

            {players.length >= 1 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">

                {/* Status Text */}

                <div className="mb-5">

                  {players.length < 2 ? (
                    <>
                      <div className="text-lg font-black text-yellow-400">
                        ⏳ รอผู้เล่นคนที่ 2
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        ส่ง Room Code ให้เพื่อนเพื่อเข้าร่วม
                      </p>
                    </>
                  ) : players.every(
                      (player) =>
                        Boolean(player.ready)
                    ) ? (
                    <>
                      <div className="text-lg font-black text-green-400">
                        🔥 ผู้เล่นทั้ง 2 คนพร้อมแล้ว!
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        สามารถเริ่มการแข่งขันได้
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-black text-yellow-400">
                        ⚡ รอผู้เล่นกด READY
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        ผู้เล่นทั้ง 2 คนต้องกด READY
                      </p>
                    </>
                  )}

                </div>

                {/* ========================================
                    BUTTONS
                ======================================== */}

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

                  {/* READY BUTTON */}

                  <button
                    onClick={toggleReady}
                    disabled={players.length !== 2}
                    className={`rounded-xl px-8 py-3 font-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${
                      ready
                        ? "bg-green-500 text-slate-950 hover:bg-green-400"
                        : "border border-green-500 text-green-400 hover:bg-green-500 hover:text-slate-950"
                    }`}
                  >
                    {ready
                      ? "🟢 READY แล้ว"
                      : "⚡ READY"}
                  </button>

                  {/* ====================================
                      START GAME BUTTON

                      สำคัญ:
                      ปุ่มนี้ไม่ใช้

                      socket.id === ownerId

                      ในการซ่อนปุ่มแล้ว

                      เพราะถ้า ownerId ไม่ตรง
                      ปุ่มจะหายทันที

                      ให้ปุ่มแสดงเมื่อครบ 2 คน
                      และ READY ครบ

                      Server จะเป็นผู้ตรวจสอบ
                      ว่าใครมีสิทธิ์เริ่มเกม
                  ==================================== */}

                  {players.length === 2 &&
                    players.every(
                      (player) =>
                        Boolean(player.ready)
                    ) && (
                      <button
                        onClick={startGame}
                        disabled={loading}
                        className="rounded-xl bg-green-500 px-8 py-3 font-black text-slate-950 shadow-lg shadow-green-500/20 transition hover:scale-105 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {loading
                          ? "⏳ กำลังเริ่ม..."
                          : "⚽ เริ่มการแข่งขัน"}
                      </button>
                    )}

                </div>

                {/* ========================================
                    OWNER MESSAGE
                ======================================== */}

                {players.length === 2 &&
                  players.every(
                    (player) =>
                      Boolean(player.ready)
                  ) && (
                    <p className="mt-4 text-xs text-slate-500">
                      👑 คนสร้างห้องเท่านั้นที่สามารถเริ่มการแข่งขันได้
                    </p>
                  )}

              </div>
            )}

            {/* ============================================
                LEAVE ROOM
            ============================================ */}

            <div className="mt-6 text-center">

              <button
                onClick={leaveRoom}
                className="rounded-xl border border-red-500/40 px-5 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                🚪 ออกจากห้อง
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            PLAYING
        ================================================= */}

        {status === "playing" && (
          <div className="rounded-3xl border border-green-500/30 bg-slate-900 p-10 text-center shadow-2xl">

            <div className="text-6xl">
              ⚽
            </div>

            <h2 className="mt-5 text-3xl font-black text-green-400">
              🔥 เริ่มการแข่งขันแล้ว!
            </h2>

            <p className="mt-3 text-slate-400">
              กำลังเข้าสู่สนามแข่งขัน...
            </p>

            <div className="mt-6">

              <button
                onClick={() =>
                  navigate(
                    `/football/multiplayer/game?room=${encodeURIComponent(
                      roomCode
                    )}`
                  )
                }
                className="rounded-xl bg-green-500 px-8 py-3 font-black text-slate-950 transition hover:bg-green-400"
              >
                ⚽ เข้าสู่การแข่งขัน
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// =====================================================
// PLAYER CARD
// =====================================================

function PlayerCard({
  player,
  isMe,
  isOwner,
}) {
  const playerName =
    player?.name ||
    player?.playerName ||
    "Unknown Player";

  const isReady =
    Boolean(player?.ready);

  return (
    <div
      className={`relative rounded-2xl border p-5 transition ${
        isReady
          ? "border-green-500/40 bg-green-500/5"
          : "border-slate-800 bg-slate-950"
      }`}
    >

      {/* Owner */}

      {isOwner && (
        <div className="absolute right-4 top-4 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-bold text-yellow-400">
          👑 HOST
        </div>
      )}

      <div className="flex items-center gap-4">

        {/* Avatar */}

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
            isReady
              ? "bg-green-500 text-slate-950"
              : "bg-slate-800"
          }`}
        >
          ⚽
        </div>

        {/* Info */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h4 className="truncate text-lg font-black">
              {playerName}
            </h4>

            {isMe && (
              <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-black text-blue-400">
                YOU
              </span>
            )}

          </div>

          <div className="mt-1">

            {isReady ? (
              <span className="text-sm font-bold text-green-400">
                🟢 READY
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-500">
                ⚪ NOT READY
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// EMPTY PLAYER SLOT
// =====================================================

function EmptyPlayerSlot({ number }) {
  return (
    <div className="flex min-h-[106px] items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50">

      <div className="text-center">

        <div className="text-2xl">
          👤
        </div>

        <p className="mt-1 text-sm font-bold text-slate-600">
          Player {number}
        </p>

        <p className="text-xs text-slate-700">
          Waiting...
        </p>

      </div>

    </div>
  );
}