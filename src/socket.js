import { io } from "socket.io-client";

// Connect to backend Socket.IO server on port 5000
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1500
});

export default socket;
