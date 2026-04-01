import { Router } from "express";
import { register, verifyEmail, login, getMe , resendVerificationEmail,logout} from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
import { createRateLimit } from "../middleware/rate-limit.middleware.js";
import { AUTH_LIMIT_MAX_REQUESTS, AUTH_LIMIT_WINDOW_MS } from "../config/limits.js";

const authRouter = Router();
const authRateLimit = createRateLimit({
    windowMs: AUTH_LIMIT_WINDOW_MS,
    maxRequests: AUTH_LIMIT_MAX_REQUESTS,
    message: "Too many authentication attempts. Please wait a few minutes and try again.",
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", authRateLimit, registerValidator, register);


/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post("/login", authRateLimit, loginValidator, login)



/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user's details
 * @access Private
 */
authRouter.get('/get-me', authUser, getMe)

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get('/verify-email', verifyEmail)


authRouter.get("/resend-verification", resendVerificationEmail);


/**
 * @route POST /api/auth/logout
 * @desc Logout user and clear cookie
 * @access Private
 */
authRouter.post("/logout", authUser, logout)

export default authRouter;
