import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";
import { client as redisClient } from "./redis.config.js";

type RateLimitOptions = {
    windowSeconds?: number;
    maxRequests?: number;
    message?: string;
}

const slidingLimiter = ({
    windowSeconds = 60,
    maxRequests = 10,
    message = "Too many request"
}: RateLimitOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip;
        console.log(ip)
        const key = `rate_limit:${ip}`;
        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;

        try {
            // remove old request
            await redisClient.zRemRangeByScore(key, 0, windowStart);

            // count requests
            const count = await redisClient.zCard(key);
            console.log(count)
            console.log(windowStart)

            if (count >= maxRequests) {
                return next(new AppError(message, 426))
            }

            // add current request
            await redisClient.zAdd(key, [{ score: now, value: `${now}` }]);

            // set expiry
            await redisClient.expire(key, windowSeconds);

            next();
        } catch (err) {
            logger.error(err)
            next()
        }
    }


}


export default slidingLimiter;