import { prisma } from "../../shared/config/prismaClient.config.js";
import { AuditSeverity, type AuditAction } from "./audit.types.js";


export const logEvent = async ({
    userId,
    action,
    severity = AuditSeverity.INFO,
    description,
    ip,
    userAgent,
    metadata
}: {
    userId?: string;
    action: AuditAction;
    severity?: AuditSeverity
    description?: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId as string,
                action,
                severity,
                description: description as string,
                ipAddress: ip as string,
                userAgent: userAgent as string,
                metadata
            },
        });
    } catch (error) {
        console.error("Failed to log audit event:", error);
    }
}