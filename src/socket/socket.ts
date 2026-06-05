import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { socketAuthMiddleware } from "./socket.middlware.js";
import { chatHandler } from "./chat.handler.js";
import { allowedOrigins } from "../config/cors.js";
import {
  AUTHORIZATION_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_GET,
  HTTP_POST,
  NGROK_SKIP_BROWSER_WARNING_HEADER,
} from "../constants/labels.js";
import {
  SOCKET_SERVER_INITIALIZED,
  SOCKET_SERVER_NOT_INITIALIZED,
  SOCKET_USER_CONNECTED,
} from "../constants/messages.js";

let io: Server;

export const initSocket = (server: httpServer) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: [HTTP_GET, HTTP_POST],
      allowedHeaders: [
        CONTENT_TYPE_HEADER,
        AUTHORIZATION_HEADER,
        NGROK_SKIP_BROWSER_WARNING_HEADER,
      ],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`${SOCKET_USER_CONNECTED}: ${socket.id}`);

    chatHandler(io, socket);
  });

  console.log(SOCKET_SERVER_INITIALIZED);
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error(SOCKET_SERVER_NOT_INITIALIZED);
  }
  return io;
};
