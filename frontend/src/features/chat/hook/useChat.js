import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch } from "react-redux"

export const useChat = () => {
    const dispatch = useDispatch()

    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        const data = await sendMessage({ message, chatId })
        const { chat, aimessage } = data

        const resolvedChatId = chat?._id ?? aimessage.chat

        if (chat) {
            dispatch(createNewChat({
                chatId: resolvedChatId,
                title: chat.title ?? "New Chat"
            }))
        }

        dispatch(addNewMessage({
            chatId: resolvedChatId,
            content: message,
            role: "user"
        }))
        dispatch(addNewMessage({
            chatId: resolvedChatId,
            content: aimessage.content,
            role: aimessage.role
        }))
        dispatch(setCurrentChatId(resolvedChatId))
        dispatch(setLoading(false))
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChats(chatId) {
        const data = await getMessages(chatId)
        const { message } = data

        const formattedMessages = message.map(msg => ({
            content: msg.content,
            role: msg.role
        }))
        dispatch(addMessages({
            chatId,
            messages: formattedMessages
        }))
        dispatch(setCurrentChatId(chatId))

    }
    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChats
    }
}