import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, getUsageLimits } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, removeChat } from "../chat.slice";
import { useDispatch } from "react-redux"

export const useChat = () => {
    const dispatch = useDispatch()

    /* ── NEW CHAT ── */
    function handleNewChat() {
        dispatch(setCurrentChatId(null))
    }

    /* ── DELETE CHAT ── */
    async function handleDeleteChat(chatId, currentChatId, chats) {
        const data = await deleteChat(chatId)
        if (!data) return

        dispatch(removeChat(chatId))

        /* if deleted chat was open — switch to next available or null */
        if (chatId === currentChatId) {
            const remaining = Object.keys(chats).filter(id => id !== chatId)
            dispatch(setCurrentChatId(remaining.length > 0 ? remaining[0] : null))
        }
    }

    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        try {
            const data = await sendMessage({ message, chatId })
            const { chat, aimessage } = data

            const resolvedChatId = chat?._id ?? aimessage.chat

            if (chat) {
                dispatch(createNewChat({
                    chatId: resolvedChatId,
                    title: chat.title ?? "New Chat"
                }))
            }

            dispatch(addNewMessage({ chatId: resolvedChatId, content: message,          role: "user"          }))
            dispatch(addNewMessage({ chatId: resolvedChatId, content: aimessage.content, role: aimessage.role  }))
            dispatch(setCurrentChatId(resolvedChatId))
            return data
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        try {
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                    preview: "Open to continue this conversation",
                }
                return acc
            }, {})))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChats(chatId, chats) {
        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { message } = data
            const formattedMessages = message.map(msg => ({
                content: msg.content,
                role: msg.role
            }))
            dispatch(addMessages({ chatId, messages: formattedMessages }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleGetUsageLimits() {
        return getUsageLimits()
    }

    return {
        initializeSocketConnection,
        handleNewChat,
        handleDeleteChat,
        handleSendMessage,
        handleGetChats,
        handleOpenChats,
        handleGetUsageLimits,
    }
}
