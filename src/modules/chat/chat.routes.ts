import { Router } from "express";
import chatController from "./chat.controller.js";
import {
  CHATID,
  GET_MY_CHATS,
  MESSAGES,
  ROOT,
} from "../../constants/routes.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post(ROOT, authenticate, chatController.createChat);

router.post(
  `${CHATID}${MESSAGES}`,
  authenticate,
  chatController.getChatMessages
);

router.post(GET_MY_CHATS, authenticate, chatController.getUserChats);
export default router;
