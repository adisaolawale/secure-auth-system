import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as roleService from "./role.service.js";
import successResponse from "../../shared/utils/successResponse.js";
import { getClientInfo } from "../../shared/utils/getClientInfo.js";


export const createRole = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { ip, userAgent } = getClientInfo(req)
    const role = await roleService.createRole(req.body, req.user?.id, ip as string, userAgent as string);
    return successResponse({
        res,
        statusCode: 201,
        message: "Role created successfully",
        data: role
    })
})

export const assignPermission = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { roleId, permissionId } = req.body
    const { ip, userAgent } = getClientInfo(req)
    const result = await roleService.assignPermissionToRole(roleId, permissionId, req.user?.id, ip as string, userAgent as string);
    return successResponse({
        res,
        statusCode: 201,
        message: "Permission assigned to role successfully",
        data: result
    })
})

