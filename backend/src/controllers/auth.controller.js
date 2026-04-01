import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
// import { sendEmail } from "../services/mail.service.js";


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {

    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({
        username,
        email,
        password,
        verified: true
    })

    // Email verification is temporarily disabled for deployment.
    // const emailVerificationToken = jwt.sign({
    //     email: user.email,
    // }, process.env.JWT_SECRET)
    //
    // await sendEmail({
    //     to: email,
    //     subject: "Welcome to Perplexity!",
    //     html: `
    //         <p>Hi ${username},</p>
    //         <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
    //         <p>Please verify your email address by clicking the link below:</p>
    //         <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}">
    //             Verify Email
    //         </a>
    //
    //         <hr />
    //
    //         <p>Didn't receive the email or link not working?</p>
    //         <a href="http://localhost:3000/api/auth/resend-verification?email=${encodeURIComponent(email)}">
    //             Resend Verification Email
    //         </a>
    //
    //         <p>If you did not create an account, please ignore this email.</p>
    //         <p>Best regards,<br>The Perplexity Team</p>
    //     `
    // })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}


/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token, email }
 */
export async function verifyEmail(req, res) {
    // const { token } = req.query;
    //
    // try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //
    //     const user = await userModel.findOne({ email: decoded.email });
    //
    //     if (!user) {
    //         return res.status(400).json({
    //             message: "Invalid token",
    //             success: false,
    //             err: "User not found"
    //         })
    //     }
    //
    //     user.verified = true;
    //     await user.save();
    //
    //     const html = `
    //         <h1>Email Verified Successfully!</h1>
    //         <p>Your email has been verified. You can now log in to your account.</p>
    //         <a href="http://localhost:5173/login">Go to Login</a>
    //     `
    //
    //     return res.send(html);
    //
    // } catch (err) {
    //     return res.status(400).send(`
    //         <h2>Verification Link Expired or Invalid</h2>
    //         <p>Your verification link may have expired or is no longer valid.</p>
    //         <a href="http://localhost:3000/api/auth/resend-verification?email=${encodeURIComponent(req.query.email || '')}">
    //             Resend Verification Email
    //         </a>
    //         <p><small>If the button doesn't work, go back and request a new link from the login page.</small></p>
    //     `)
    // }

    return res.status(200).send(`
        <h1>Email Verification Temporarily Off</h1>
        <p>Email verification is disabled for now. Your account can be used right away.</p>
    `);
}


/**
 * @desc Resend verification email to user
 * @route GET /api/auth/resend-verification
 * @access Public
 * @query { email }
 */
export async function resendVerificationEmail(req, res) {
    // const { email } = req.query;
    //
    // if (!email) {
    //     return res.status(400).json({
    //         message: "Email is required",
    //         success: false,
    //         err: "Missing email"
    //     });
    // }
    //
    // const user = await userModel.findOne({ email });
    //
    // if (!user) {
    //     return res.status(404).json({
    //         message: "No account found with this email",
    //         success: false,
    //         err: "User not found"
    //     });
    // }
    //
    // if (user.verified) {
    //     return res.status(400).json({
    //         message: "This email is already verified",
    //         success: false,
    //         err: "Email already verified"
    //     });
    // }
    //
    // const emailVerificationToken = jwt.sign(
    //     { email: user.email },
    //     process.env.JWT_SECRET
    // );
    //
    // await sendEmail({
    //     to: email,
    //     subject: "Resend: Verify your Perplexity account",
    //     html: `
    //         <p>Hi ${user.username},</p>
    //         <p>You requested a new verification link. Click below to verify your email:</p>
    //         <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}">
    //             Verify Email
    //         </a>
    //
    //         <hr />
    //
    //         <p>Didn't receive the email or link not working?</p>
    //         <a href="http://localhost:3000/api/auth/resend-verification?email=${encodeURIComponent(email)}">
    //             Resend Verification Email
    //         </a>
    //
    //         <p>If you did not request this, please ignore this email.</p>
    //         <p>Best regards,<br>The Perplexity Team</p>
    //     `
    // });
    //
    // return res.status(200).json({
    //     message: "Verification email resent successfully",
    //     success: true
    // });

    return res.status(200).json({
        message: "Email verification is temporarily disabled",
        success: true
    });
}

export async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })
    res.status(200).json({ message: "Logged out successfully" })
}
 
