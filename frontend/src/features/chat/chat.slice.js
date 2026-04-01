import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[chatId] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
                preview: "New conversation",
            }
        },
        removeChat: (state, action) => {
            delete state.chats[action.payload]
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            state.chats[chatId].messages.push({
                content,
                role,
                timestamp: new Date().toISOString()
            })
            state.chats[chatId].lastUpdated = new Date().toISOString()
            state.chats[chatId].preview = content.slice(0, 90)
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.chats[chatId].messages.push(...messages)
            const lastMessage = messages[messages.length - 1]
            if (lastMessage) {
                state.chats[chatId].preview = lastMessage.content.slice(0, 90)
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    addNewMessage,
    addMessages,
    removeChat,
} = chatSlice.actions

export default chatSlice.reducer
