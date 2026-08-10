import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

// Module-level singleton — one socket connection per browser session
let socket = null;

export const getSocket = () => {
  if (!socket || socket.disconnected) {
    socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
