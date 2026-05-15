import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
// Note: We use .js here because of NodeNext, assuming a db.ts file exists!
import { prisma } from "../config/prismaClient.config.js";
import AppError from '../utils/appError.js';


// In your auth middleware or a types file
import type { User, UserRole, Role, RolePermission, Permission } from '../../generated/prisma/client.js';

// 1. Define the fully loaded User type
export type UserWithRoles = User & {
    userRoles: (UserRole & {
        role: Role & {
            rolePermissions: (RolePermission & {
                permission: Permission;
            })[];
        };
    })[];
};

// 2. Augment the Express namespace
// declare global {
//     namespace Express {
//         // This MUST match the base type if Passport is also involved, 
//         // or we use 'any' briefly to override strict conflicts if necessary.
//         interface User extends UserWithRoles { }

//         interface Request {
//             user?: User; // This now refers to our expanded User interface above
//         }
//     }
// }


// Define the shape of decoded token
interface TokenPayload {
    id: string;
    sessionId: string;
    [key: string]: any;
}

// Tell TypeScript that the Express Request object is allowed to have a 'user' property attached
// declare global {
//     namespace Express {
//         interface Request {
//             user?: User;
//         }
//     }
// }

export const hashToken = (token: string) => {
    return createHash("sha256").update(token).digest("hex")
}

export function generateAccessToken(payload: string | object | Buffer) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as NonNullable<jwt.SignOptions['expiresIn']>
    } as jwt.SignOptions);
}


export function generateAccessToken1(payload: object) {
    const secret = process.env.JWT_ACCESS_SECRET as string
    return jwt.sign(payload, secret, {
        expiresIn: '15m'
    } as jwt.SignOptions);
}

export function generateRefreshToken(payload: string | object | Buffer) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as NonNullable<jwt.SignOptions['expiresIn']>
    } as jwt.SignOptions);
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
}

// ── Protect routes — require valid access token
export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1] as string;
        const decoded = verifyAccessToken(token);


        // const sessionCheck = await prisma.session.findUnique({
        //     where: { id: decoded.sessionId, isValid: true }
        // })

        // console.log('sessionCheck', sessionCheck)
        // if (sessionCheck === null) {
        //     res.status(401).json({ error: 'Login Session Expired'});
        //     return;
        // }


        // Fetch user from DB
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true, fullName: true, isActive: true, isSuspended: true }
        });

        // Update this section in your protect function
        // const user = await prisma.user.findUnique({
        //     where: { id: decoded.id },
        //     include: {
        //         userRoles: {
        //             include: {
        //                 role: {
        //                     include: {
        //                         rolePermissions: {
        //                             include: {
        //                                 permission: true
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // });

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({ error: 'Account deactivated' });
            return;
        }
        if (user.isSuspended) {
            res.status(403).json({ error: 'Account suspended' });
            return;
        }

        req.user = decoded;
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
            return;
        }
        res.status(401).json({ error: 'Invalid token' });
    }
}




// ── Require platform admin
// export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
//     if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
//         res.status(403).json({ error: 'Admin access required' });
//         return;
//     }
//     next();
// }

// ── Optional auth — attach user if token present but do not block
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.split(' ')[1] as string;
        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true, fullName: true, isActive: true, isSuspended: true }
        });

        const { userRoles, ...userWithoutRoles } = user as any;

        if (user) req.user = decoded;
        // if (user) req.user = user;
    } catch {
        // Ignore error
    }
    next();
}
