import asyncHandler from "../../shared/utils/asyncHandler.js"
import type { Request, Response, NextFunction } from "express"
import * as service from "./user.service.js"
import successResponse from "../../shared/utils/successResponse.js"


export const getMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const user = await service.getMe(req.user?.id)
    return successResponse({
        res,
        data: { user }
    })
})

export const updateProfile = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const data = req.body
    const result = await service.updateProfile(req.user?.id, data)
    return successResponse({
        res,
        data: { result }
    })
})

export const changePassword = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const data = req.body
    const { currentPassword, newPassword } = data
    const result = await service.changePassword(req.user?.id, currentPassword, newPassword)
    return successResponse({
        res,
        data: { result },
        message: "Password changed successfully"
    })
})

export const searchUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q
    const result = await service.searchUsers(query as string)
    return successResponse({
        res,
        data: { result }
    })
})

export const deactivateAccount = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const result = await service.deactivateAccount(req.user?.id)
    return successResponse({
        res,
        data: { result }
    })
})