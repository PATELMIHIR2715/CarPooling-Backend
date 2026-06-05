import { Server, Socket } from "socket.io";
import prisma from "../config/database.js";
import {
  SOCKET_DISCONNECT,
  SOCKET_JOIN_ROOM,
  SOCKET_MARK_AS_READ,
  SOCKET_NEW_MESSAGE,
  SOCKET_PREVIOUS_MESSAGES,
  SOCKET_SEND_MESSAGE,
  SOCKET_STOP_TYPING,
  SOCKET_TYPING,
  SORT_DESC,
} from "../constants/labels.js";

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on(SOCKET_JOIN_ROOM, async (roomId: string) => {
    socket.join(roomId);
    const messages = await prisma.message.findMany({
      where: { chatId: roomId },
      orderBy: { createdAt: SORT_DESC },
      take: 50,
      include: {
        sender: {
          select: { name: true },
        },
      },
    });
    socket.emit(SOCKET_PREVIOUS_MESSAGES, messages);
  });

  socket.on(
    SOCKET_SEND_MESSAGE,
    async (data: { roomId: string; content: string }) => {
      const { roomId, content } = data;
      const senderId = (socket as any).user.userId;

      const message = await prisma.message.create({
        data: {
          chatId: roomId,
          senderId,
          content,
        },
      });
      io.to(roomId).emit(SOCKET_NEW_MESSAGE, message);
    }
  );

  socket.on(SOCKET_TYPING, (roomId: string) => {
    socket.to(roomId).emit(SOCKET_TYPING, { userId: socket.id });
  });

  socket.on(SOCKET_STOP_TYPING, (roomId: string) => {
    socket.to(roomId).emit(SOCKET_STOP_TYPING, { userId: socket.id });
  });

  socket.on(SOCKET_MARK_AS_READ, async (data: { roomId: string }) => {
    const { roomId } = data;
    const userId = (socket as any).user.userId;

    await prisma.message.updateMany({
      where: { chatId: roomId, senderId: { not: userId } },
      data: { isRead: true },
    });
  });

  socket.on(SOCKET_DISCONNECT, async (roomId: string) => {
    socket.leave(roomId);
  });
};
