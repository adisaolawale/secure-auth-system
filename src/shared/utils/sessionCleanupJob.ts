import cron from "node-cron"
import { prisma } from "../config/prismaClient.config.js"
import logger from "./logger.js"

export const startSessionCleanup = async () => {
    cron.schedule('0 * * * *', async () => {
        logger.info("Running session cleanup job...")
        try {
            await prisma.session.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            })
        } catch (error) {
            logger.error("Error occured while rinning token cleanup job")
        }
    })
}