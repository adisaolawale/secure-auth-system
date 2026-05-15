import { prisma } from "../../shared/config/prismaClient.config.js";
import AppError from "../../shared/utils/appError.js";
import { logEvent } from "../audit/audit.service.js";
import { AuditAction } from "../audit/audit.types.js";

export const createRole = async (data: {
    name: string;
    description?: string;
    permission: string[];
}, userId: string, ip: string, userAgent: string) => {
    // Only allow selecting existing permissions
    const perms = await prisma.permission.findMany({
        where: {
            name: { in: data.permission }
        }
    });

    const role = await prisma.role.create({
        data: {
            name: data.name,
            isSystem: false,
            permissions: {
                create: perms.map(p => ({
                    permissionId: p.id
                }))
            }
        }
    });

    await logEvent({
        userId: userId,
        action: AuditAction.ROLE_CREATED,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return role;
}

export const updateRole = async (roleId: string, data: any, userId: string, ip: string, userAgent: string) => {
    const role = await prisma.role.findUnique({
        where: { id: roleId }
    });

    if (role?.isSystem) {
        throw new AppError("Cannot modify system role", 403)
    }

    return prisma.role.update({
        where: { id: roleId },
        data
    });
};

export const assignPermissionToRole = async (
    roleId: string,
    permissionId: string,
    userId: string,
    ip: string,
    userAgent: string
) => {

    const assign = await prisma.rolePermission.create({
        data: { roleId, permissionId }
    })

    await logEvent({
        userId: userId,
        action: AuditAction.ROLE_UPDATED,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return assign;
};

export const assignRoleToUser = async (
    userId: string,
    roleId: string
) => {
    return prisma.userRole.create({
        data: { userId, roleId }
    })
}