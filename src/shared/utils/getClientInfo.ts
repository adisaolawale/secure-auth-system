import * as UAParser from 'ua-parser-js';
import type { Request } from "express";


export const getClientInfo = (req: Request) => {
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip;

    const userAgent = req.headers["user-agent"];

    const parser = new UAParser.UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const device = `${deviceInfo.device.model || "Unknown"} - ${deviceInfo.os.name || "Unknown OS"} (${deviceInfo.browser.name || "Unknown Browser"})`;

    return {
        ip,
        userAgent,
        device
    }
}