import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { socketAuthMiddleware } from "./socket.middlware.js";
import { chatHandler } from "./chat.handler.js";

let io: Server;

export const initSocket = (server: httpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // or specifically "http://localhost:5173"
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "ngrok-skip-browser-warning",
      ],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    chatHandler(io, socket);
  });

  console.log("Socket.io server initialized");
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io server not initialized");
  }
  return io;
};
