import { Router } from 'express'
import {sendMessage,getChats,getMessages,deleteChat} from '../controllers/chat.controller.js'
import { authUser } from '../middleware/auth.middleware.js'
import { enforceChatUsageLimit, getChatUsage, validateChatMessage } from '../middleware/chat-limit.middleware.js'

const chatRouter = Router()

chatRouter.post("/message",authUser,validateChatMessage,enforceChatUsageLimit,sendMessage)

chatRouter.get("/",authUser,getChats)
chatRouter.get("/:chatId/messages",authUser,getMessages)
chatRouter.get("/usage/limits", authUser, getChatUsage)


chatRouter.delete("/delete/:chatId", authUser, deleteChat)

export default chatRouter
