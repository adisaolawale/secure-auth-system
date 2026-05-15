import type { Response } from 'express'

type SuccessResponse<T = any, M = any> = {
    res: Response,
    statusCode?: number,
    message?: string,
    data?: T | null,
    meta?: M | null
}

function successResponse<T = any, M = any>({
    res,
    statusCode = 200,
    message = "Successful",
    data = null,
    meta = null
}: SuccessResponse<T, M>) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta
    })
}

export default successResponse;