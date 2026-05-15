import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

// export const requirePermission = (permission: string) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!req.user) {
//             throw new AppError("User not authenticated", 401);
//         }

//         // Flatten nested permissions from user -> userRoles -> role -> rolePermissions -> permission
//         const userPermissions = req.user.userRoles.flatMap(ur => 
//             ur.role.rolePermissions.map(rp => rp.permission.name)
//         );

//         if (!userPermissions.includes(permission)) {
//             throw new AppError("Forbidden", 403);
//         }

//         next();
//     };
// };


// export const requirePermission = (permission: string) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!req.user) {
//             throw new AppError("User not authenticated", 401);
//         }

//         // Deeply extract permission names: User -> UserRole -> Role -> RolePermission -> Permission.name
//         const allPermissions = req.user.roles.flatMap((ur) =>
//             ur.role.rolePermissions.map((rp) => rp.permission.name)
//         );

//         if (!allPermissions.includes(permission)) {
//             throw new AppError("Forbidden", 403);
//         }

//         next();
//     };
// };

export const authorizePermissions = (...required: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        const userPerms = req.user?.permissions || [];

        const allowed = required.every((perm) => userPerms.includes(perm));

        if (!allowed) {
            throw new AppError("Forbidden", 403)
        }

        next();
    }
}


// Role check (optional)
export const authorizeRoles = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        const userRoles = req.user?.roles || [];

        const allowed = userRoles.some((r: string) => roles.includes(r));

        if (!allowed) {
            throw new AppError("Forbidden", 403)
        }

        next();
    }
}