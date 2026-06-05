import { Server, Socket } from "socket.io";
import prisma from "../config/database.js";

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on("joinRoom", async (roomId: string) => {
    socket.join(roomId);
    const messages = await prisma.message.findMany({
      where: { chatId: roomId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: {
          select: { name: true },
        },
      },
    });
    socket.emit("previousMessages", messages);
  });

  socket.on(
    "sendMessage",
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
      io.to(roomId).emit("newMessage", message);
    }
  );

  socket.on("typing", (roomId: string) => {
    socket.to(roomId).emit("typing", { userId: socket.id });
  });

  socket.on("stopTyping", (roomId: string) => {
    socket.to(roomId).emit("stopTyping", { userId: socket.id });
  });

  socket.on("markAsRead", async (data: { roomId: string }) => {
    const { roomId } = data;
    const userId = (socket as any).user.userId;

    await prisma.message.updateMany({
      where: { chatId: roomId, senderId: { not: userId } },
      data: { isRead: true },
    });
  });

  socket.on("disconnect", async (roomId: string) => {
    socket.leave(roomId);
  });
};
