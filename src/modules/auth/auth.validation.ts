import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be atleast 3 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Username is required'
        }),
    fullName: Joi.string()
        .min(3)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Name must be atleast 3 characters',
            'string.max': 'Name cannot exceed 50 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .max(32)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'Password must be atleast 8 characters',
            'string.max': 'Password cannot exceed 32 characters',
            'string.email': 'Please provide a valid email',
            'any.required': 'Password is required'
        })
})
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .max(32)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'Password must be atleast 8 characters',
            'string.max': 'Password cannot exceed 32 characters',
            'string.email': 'Please provide a valid email',
            'any.required': 'Password is required'
        }),
})


// import { z } from "zod"

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/

// export const registerSchema = z.object({
//     body: z.object({
//         username: z.string()
//             .min(3, "Name must be atleast 3 characters")
//             .max(50, "Name cannot exceed 50 characters"),

//         fullName: z.string()
//             .min(3, "Name must be atleast 3 characters")
//             .max(50, "Name cannot exceed 50 characters")
//             .optional(),

//         email: z.string()
//             .email("Please provide a valid email"),

//         password: z.string()
//             .min(8, "Password must be atleast 8 characters")
//             .max(32, "Password cannot exceed 32 characters")
//             .regex(passwordRegex, "Password must contain uppercase, lowercase and number"),
//     })
// })

// export const loginSchema = z.object({
//     body: z.object({
//         email: z.string()
//             .email("Please provide a valid email"),

//         password: z.string()
//             .min(8, "Password must be atleast 8 characters")
//             .max(32, "Password cannot exceed 32 characters")
//             .regex(passwordRegex, "Password must contain uppercase, lowercase and number"),
//     })
// })