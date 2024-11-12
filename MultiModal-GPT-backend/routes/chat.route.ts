import { Router } from "express";
import { ChatController, GetChatHistoryController, GetUserChatsController } from "../controller/chat.controller";
import rateLimitMiddleware from "../middleware/use-rate-limit";

const ChatRouter = Router()
// @ts-ignore
ChatRouter.post("/chat", rateLimitMiddleware, ChatController);

// New endpoints for chat history
// @ts-ignore
ChatRouter.get("/chat/:chatId", GetChatHistoryController);
// @ts-ignore
ChatRouter.post("/chats", GetUserChatsController);

export default ChatRouter