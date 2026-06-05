import type { Response } from "express";
import chatService from "./chat.service.js";
import { errorResponse } from "../../utils/error.utils.js";

class ChatController {
  async getUserChats(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const chats = await chatService.getUserChats(userId, req.body);
      res.status(200).json(chats);
    } catch (error) {
      errorResponse(error, res);
    }
  }
  async getChatMessages(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const chatId = req.params.chatId;
      const messages = await chatService.getChatMessages(
        chatId,
        userId,
        req.body
      );
      res.status(200).json(messages);
    } catch (error) {
      errorResponse(error, res);
    }
  }
  async createChat(req: any, res: Response) {
    try {
      const { bookingId } = req.body;
      const userId = req.user.userId;
      const chat = await chatService.makeChat(bookingId, userId);
      res.status(200).json(chat);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new ChatController();
