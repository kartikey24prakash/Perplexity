import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, clearUser, setLoading, setError, clearError } from "../auth.slice";
import { setChats, setCurrentChatId } from "../../chat/chat.slice";

export function useAuth() {

    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(clearError())
            await register({ email, username, password })
            return true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(clearError())
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            if (err.response?.status === 401) {
                dispatch(clearUser())
            } else {
                dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
            }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true))
            await logout()
            dispatch(clearUser())
            dispatch(setChats({}))
            dispatch(setCurrentChatId(null))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Logout failed"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
        clearAuthError: () => dispatch(clearError()),
    }
}
