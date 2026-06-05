import type { Response } from "express";
import chatService from "./chat.service.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../utils/response.utils.js";

class ChatController {
  async getUserChats(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const chats = await chatService.getUserChats(userId, req.body);
      successResponse(res, chats, 200);
    } catch (error) {
      errorResponseStandard(error, res);
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
      successResponse(res, messages, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
  async createChat(req: any, res: Response) {
    try {
      const { bookingId } = req.body;
      const userId = req.user.userId;
      const chat = await chatService.makeChat(bookingId, userId);
      successResponse(res, chat, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new ChatController();
