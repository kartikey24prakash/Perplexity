function getClientKey(req) {
    return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

export function createRateLimit({ windowMs, maxRequests, message }) {
    const bucket = new Map();

    return function rateLimit(req, res, next) {
        const key = getClientKey(req);
        const now = Date.now();
        const timestamps = (bucket.get(key) || []).filter((time) => now - time < windowMs);

        if (timestamps.length >= maxRequests) {
            return res.status(429).json({
                message,
                success: false,
            });
        }

        timestamps.push(now);
        bucket.set(key, timestamps);
        next();
    };
}
