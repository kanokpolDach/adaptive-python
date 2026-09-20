import { io } from "socket.io-client";

const SOCKET_URL = "https://adaptive-python.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});