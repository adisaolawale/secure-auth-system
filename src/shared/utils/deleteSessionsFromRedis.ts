import { client } from "../config/redis.config.js";

async function deleteSessionsFromRedis(sessionIds: string[]) {
    if(!sessionIds.length) return;

    const pipeline = client._executePipeline


}