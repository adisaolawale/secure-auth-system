import slidingLimiter from "../config/rateLimit.config.js";

export const authLimiter = slidingLimiter({
    windowSeconds: 15 * 60,
    maxRequests: 10,
    message: "Too many auth attempts. Try again in 15 minutes.",
});

export const sensitiveActionLimiter = slidingLimiter({
    windowSeconds: 60 * 60,
    maxRequests: 5,
    message: "Too many attempts. Try again in 1 hour.",
});

export const apiLimiter = slidingLimiter({
    windowSeconds: 60 * 60,
    maxRequests: 60,
});