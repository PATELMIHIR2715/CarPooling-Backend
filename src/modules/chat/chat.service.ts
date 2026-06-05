import prisma from "../../config/database.js";
import {
  buildFilterQuery,
  buildPaginationMeta,
  type FilterInput,
} from "../../utils/buildquery.utils.js";
import {
  BOOKING_ACCESS_DENIED,
  BOOKING_NOT_FOUND,
  CHAT_ACCESS_DENIED,
} from "../../constants/messages.js";
import { SORT_DESC } from "../../constants/labels.js";

class ChatService {
  async createChat(rideId: string, driverId: string, passengerId: string) {
    const existingChat = await prisma.chat.findFirst({
      where: {
        rideId,
        OR: [{ senderId: passengerId }, { receiverId: passengerId }],
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const chat = await prisma.chat.create({
      data: {
        rideId,
        senderId: driverId,
        receiverId: passengerId,
      },
    });
    return chat;
  }

  async makeChat(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ride: true },
    });
    if (!booking) {
      throw new Error(BOOKING_NOT_FOUND);
    }
    if (booking.ride.driverId !== userId && booking.passengerId !== userId) {
      throw new Error(BOOKING_ACCESS_DENIED);
    }

    return this.createChat(
      booking.tripId,
      booking.ride.driverId,
      booking.passengerId
    );
  }

  async getChatMessages(chatId: string, userId: string, filter: FilterInput) {
    const query = buildFilterQuery(filter);
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, OR: [{ senderId: userId }, { receiverId: userId }] },
    });

    if (!chat) {
      throw new Error(CHAT_ACCESS_DENIED);
    }

    const [messages, totalMessages] = await prisma.$transaction([
      prisma.message.findMany({
        ...query,
        where: { chatId },
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    return {
      data: messages,
      meta: buildPaginationMeta(
        totalMessages,
        Math.ceil(query.skip / query.take) + 1,
        query.take
      ),
    };
  }

  async getUserChats(userId: string, filter: FilterInput) {
    const query = buildFilterQuery(filter);
    const [trips, total] = await prisma.$transaction([
      prisma.chat.findMany({
        ...query,
        where: {
          ...query.where,
          OR: [{ receiverId: userId }, { senderId: userId }],
        },
        include: {
          message: {
            orderBy: { createdAt: SORT_DESC },
            take: 1,
          },
          sender: {
            select: { name: true },
          },
          receiver: {
            select: { name: true },
          },
          ride: {
            select: {
              origin: true,
              destinationLocation: true,
              departureTime: true,
            },
          },
        },
      }),
      prisma.chat.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      }),
    ]);
    return {
      data: trips,
      meta: buildPaginationMeta(
        total,
        Math.ceil(query.skip / query.take) + 1,
        query.take
      ),
    };
  }
}

export default new ChatService();
