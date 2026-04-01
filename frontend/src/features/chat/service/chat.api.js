import axios from 'axios'
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const api = axios.create({
    baseURL: apiBaseUrl
    ,withCredentials:true
})

export const sendMessage =async ({message,chatId})=>{
    const response = await api.post("/api/chats/message",{message,chatId})
    return response.data
}

export const getChats = async ()=>{
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async(chatId)=>{
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const getUsageLimits = async ()=>{
    const response = await api.get("/api/chats/usage/limits")
    return response.data
}

export const deleteChat = async(chatId)=>{
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

