/**
 *  @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - id
 *          - email
 *        properties:
 *          id:
 *            type: string
 *            example: "12345"
 *          email:
 *            type: string
 *            example: "user@email.com"
 *          username:
 *            type: string
 *            example: "adisa_dev"
 *          createdAt:
 *            type: string
 *            format: date-time
 */


// import { z } from "zod"
// import { registry } from "../registry.js"

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/

// export const registerBodySchema = z.object({
//     username: z.string().min(3).max(50).openapi({
//         example: "afeez_dev",
//     }),

//     email: z.string().email().openapi({
//         example: "afeez@example.com",
//     }),

//     password: z.string()
//         .min(8)
//         .max(32)
//         .regex(passwordRegex)
//         .openapi({
//             example: "Password123",
//         }),
// })

// export const registerResponseSchema = z.object({
//     success: z.boolean().openapi({ example: true }),
//     message: z.string().openapi({ example: "User registered successfully" }),
//     data: z.object({
//         id: z.string().openapi({ example: "uuid" }),
//         email: z.string(),
//         username: z.string(),
//     }),
// })

// registry.register("RegisterRequest", registerBodySchema)
// registry.register("RegisterResponse", registerResponseSchema)