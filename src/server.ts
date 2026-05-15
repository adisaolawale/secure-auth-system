import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

import { prisma } from './shared/config/prismaClient.config.js';
import logger from './shared/utils/logger.js';
import * as redis from "./shared/config/redis.config.js"
import { startSessionCleanup } from './shared/utils/sessionCleanupJob.js';


// app.listen(5000, () => {
//     console.log(`Server running on port 5000`)
// });


async function startServer() {
    try {
        // This forces Prisma to actually talk to the DB
        await prisma.$connect();
        logger.info("✅ Database connected successfully");


        await redis.connectRedis()
        logger.info("✅ Redis connected successfully")

        app.listen(3000, () => {
            logger.info(`🚀 Server running on port 3000`);
        });

        startSessionCleanup()
    } catch (error) {
        logger.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

startServer();

