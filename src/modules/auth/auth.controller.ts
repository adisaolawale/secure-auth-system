import type { Response, Request, NextFunction } from "express"
import asyncHandler from "../../shared/utils/asyncHandler.js"
import * as service from "./auth.service.js"
import successResponse from "../../shared/utils/successResponse.js"
import { getClientInfo } from "../../shared/utils/getClientInfo.js"
import AppError from "../../shared/utils/appError.js"




export const registerController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await service.register(req, req.body)
    return successResponse({
        res,
        statusCode: 201,
        message: "User created successfully, Verification code has being sent to your email.",
    })
})


export const verifyEmailController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params || req.body
    const { ip, userAgent } = getClientInfo(req);
    await service.verifyEmail(token, ip as string, userAgent as string)
    return successResponse({ res, message: "Email Verification succesful" })
})


export const loginController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    const result = await service.login(req, next, req.body)
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        //secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return successResponse({
        res,
        message: "Login successfully",
        data: result
    })
})

export const oAuthCallbackController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await service.oAuthCallback(req, req.user)
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        //secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return successResponse({
        res,
        message: "OAuth login successful",
        data: result
    })
})

export const refreshTokenController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken || req.body.refreshToken || req.headers['x-refresh-token']
    const { ip, userAgent } = getClientInfo(req);
    const result = await service.refreshToken(refreshToken, ip as string, userAgent as string)
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        //secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return successResponse({
        res,
        data: result
    })
})

export const forgotPasswordController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    const { ip, userAgent } = getClientInfo(req);
    const result = await service.forgotPassword(email, ip as string, userAgent as string)
    return successResponse({
        res,
        message: result.message
    })
})


export const resetPasswordController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params || req.body
    const { password } = req.body;
    const { ip, userAgent } = getClientInfo(req);
    await service.resetPassword({ password, token: token as string }, ip as string, userAgent as string)
    return successResponse({
        res,
        message: 'Password reset successful'
    })
})

export const logoutController = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const sessionId = req.user?.sessionId
    await service.logOut(res, sessionId)
    return successResponse({
        res,
        message: 'Logout successful'
    })
})

export const logoutSpecificDeviceController = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { sessionId } = req.params
    if (sessionId === req.user?.sessionId) {
        throw new AppError('Cannot logout current device from here', 403)
    }
    await service.logOutSpecificDevice(sessionId)
    return successResponse({
        res,
        message: 'Device logged out successfully'
    })
})


export const logoutAllController = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    await service.logOutAll(req.user?.id, req.user?.sessionId)
    return successResponse({
        res,
        message: 'Logged out from all devices'
    })
})


