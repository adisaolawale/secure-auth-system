import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi"
import AppError from "../utils/appError.js";

export const validate = (schema: ObjectSchema, property: "body" | "query" | "params" = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req[property], { abortEarly: false, stripUnknown: true })
        if (error) {
            const message = error.details.map((detail) => detail.message).join(", ");
            return next(new AppError(message, 400));
        }

        next()
    }
}


// import { ZodObject } from "zod"
// import type { Request, Response, NextFunction } from "express"

// export const validate =
//     (schema: ZodObject) =>
//         (req: Request, res: Response, next: NextFunction) => {
//             try {
//                 schema.parse({
//                     body: req.body,
//                     query: req.query,
//                     params: req.params
//                 })
//                 next()
//             } catch (error: any) {
//                 return res.status(400).json({
//                     success: false,
//                     errors: error.errors
//                 })
//             }
//         }
