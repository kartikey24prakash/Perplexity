import usageModel from "../models/usage.model.js";
import {
    CHAT_DAILY_LIMIT,
    CHAT_HOURLY_LIMIT,
    CHAT_MAX_MESSAGE_LENGTH,
    CHAT_WINDOW_MS,
} from "../config/limits.js";

const hourlyUsage = new Map();

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

export function validateChatMessage(req, res, next) {
    const rawMessage = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!rawMessage) {
        return res.status(400).json({
            message: "Message is required",
            success: false,
        });
    }

    if (rawMessage.length > CHAT_MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            message: `Message is too long. Keep it under ${CHAT_MAX_MESSAGE_LENGTH} characters.`,
            success: false,
        });
    }

    req.body.message = rawMessage;
    next();
}

export async function enforceChatUsageLimit(req, res, next) {
    const userId = req.user.id;
    const now = Date.now();
    const hourlyTimestamps = (hourlyUsage.get(userId) || []).filter((time) => now - time < CHAT_WINDOW_MS);

    if (hourlyTimestamps.length >= CHAT_HOURLY_LIMIT) {
        return res.status(429).json({
            message: `AI services are limited because of cost. You have reached the ${CHAT_HOURLY_LIMIT} messages per hour limit.`,
            success: false,
            limits: {
                hourlyLimit: CHAT_HOURLY_LIMIT,
                dailyLimit: CHAT_DAILY_LIMIT,
                hourlyRemaining: 0,
            },
        });
    }

    const dateKey = getTodayKey();
    const usage = await usageModel.findOneAndUpdate(
        {
            user: userId,
            dateKey,
            messageCount: { $lt: CHAT_DAILY_LIMIT },
        },
        {
            $inc: { messageCount: 1 },
            $setOnInsert: { user: userId, dateKey },
        },
        {
            new: true,
            upsert: true,
        }
    );

    if (!usage) {
        return res.status(429).json({
            message: `AI services are limited because of cost. You have reached the ${CHAT_DAILY_LIMIT} messages per day limit.`,
            success: false,
            limits: {
                hourlyLimit: CHAT_HOURLY_LIMIT,
                dailyLimit: CHAT_DAILY_LIMIT,
                dailyRemaining: 0,
            },
        });
    }

    hourlyTimestamps.push(now);
    hourlyUsage.set(userId, hourlyTimestamps);

    req.usage = {
        hourlyLimit: CHAT_HOURLY_LIMIT,
        dailyLimit: CHAT_DAILY_LIMIT,
        hourlyRemaining: Math.max(0, CHAT_HOURLY_LIMIT - hourlyTimestamps.length),
        dailyRemaining: Math.max(0, CHAT_DAILY_LIMIT - usage.messageCount),
        dailyUsed: usage.messageCount,
    };

    next();
}

export async function getChatUsage(req, res) {
    const userId = req.user.id;
    const dateKey = getTodayKey();
    const usage = await usageModel.findOne({ user: userId, dateKey });
    const now = Date.now();
    const hourlyTimestamps = (hourlyUsage.get(userId) || []).filter((time) => now - time < CHAT_WINDOW_MS);

    hourlyUsage.set(userId, hourlyTimestamps);

    const dailyUsed = usage?.messageCount || 0;

    return res.status(200).json({
        success: true,
        usage: {
            hourlyLimit: CHAT_HOURLY_LIMIT,
            dailyLimit: CHAT_DAILY_LIMIT,
            hourlyUsed: hourlyTimestamps.length,
            dailyUsed,
            hourlyRemaining: Math.max(0, CHAT_HOURLY_LIMIT - hourlyTimestamps.length),
            dailyRemaining: Math.max(0, CHAT_DAILY_LIMIT - dailyUsed),
            message: "AI services are limited because of cost.",
        },
    });
}
