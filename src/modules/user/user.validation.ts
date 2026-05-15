import Joi from "joi"


export const updateProfileSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(50)
        .optional()
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
        })
})


export const updateAvatarSchema = Joi.object({
    avatar: Joi.string()
        .min(3)
        .max(200)
        .uri()
        .required()
        .messages({
            'string.min': 'Name must be atleast 3 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Avatar is required'
        })
})


export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
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
    newPassword: Joi.string()
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


// import { z } from "zod"

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/

// export const updateProfileSchema = z.object({
//     body: z.object({
//         username: z.string()
//             .min(3, "Name must be atleast 3 characters")
//             .max(50, "Name cannot exceed 50 characters")
//             .optional(),

//         fullName: z.string()
//             .min(3, "Name must be atleast 3 characters")
//             .max(50, "Name cannot exceed 50 characters")
//             .optional(),
//     })
// })

// export const updateAvatarSchema = z.object({
//     body: z.object({
//         avatar: z.string()
//             .min(3, "Avatar must be atleast 3 characters")
//             .max(200, "Avatar cannot exceed 200 characters")
//             .url("Avatar must be a valid URL"),
//     })
// })

// export const changePasswordSchema = z.object({
//     body: z.object({
//         currentPassword: z.string()
//             .min(8, "Password must be atleast 8 characters")
//             .max(32, "Password cannot exceed 32 characters")
//             .regex(passwordRegex, "Password must contain uppercase, lowercase and number"),

//         newPassword: z.string()
//             .min(8, "Password must be atleast 8 characters")
//             .max(32, "Password cannot exceed 32 characters")
//             .regex(passwordRegex, "Password must contain uppercase, lowercase and number"),
//     })
// })