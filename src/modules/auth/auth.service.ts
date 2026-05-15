import * as repo from "./auth.repository.js"
import * as redis from "../../shared/config/redis.config.js"
import AppError from "../../shared/utils/appError.js";
import bcrypt from "bcryptjs"
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from "../../shared/middleware/auth.middleware.js";
import { getClientInfo } from "../../shared/utils/getClientInfo.js";
import type { NextFunction, Request, Response } from "express";
import { getToken } from "../../shared/utils/getToken.js";
import type { PasswordReset } from "./auth.type.js";
import { expandPermissions } from "../../shared/utils/permissions.js";
import { logEvent } from "../audit/audit.service.js";
import { AuditAction, AuditSeverity } from "../audit/audit.types.js";
import transport from "../../shared/config/sendMail.config.js";
import { passwordResetEmailTemplate, verificationEmailTemplate } from "../../shared/utils/emailTemplate.js";



export const register = async (req: Request, data: any) => {
    const { username, email, password, fullName } = data;

    const existingUser = await repo.findByEmail(email);
    if (existingUser) throw new AppError("User already exists", 400);

    const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS as string) || 10
    );
    const passwordHash = await bcrypt.hash(password, salt);

    const { ip, userAgent } = getClientInfo(req);

    const token = getToken();
    const verificationToken = hashToken(token);

    // Single atomic operation — all or nothing
    const user = await repo.registerUser({
        email,
        passwordHash,
        username,
        fullName,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        verificationToken
    });

    const role = await repo.findRoleByName("USER")
    await repo.addRoleToUser(role?.id as string, user.id)

    await logEvent({
        userId: user.id,
        action: AuditAction.REGISTER,
        ip: ip as string,
        userAgent: userAgent as string,
        description: `User registered with email ${email}`
    })

    await redis.set(
        `email_verify:${verificationToken}`,
        5 * 60 * 60,
        { userId: user.id, email: user.email }
    );

    // TODO: Send verification email via Resend
    console.log(token); // send the RAW token in the email, not the hash

    await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: user.email,
        subject: 'Welcome to our app! Please verify your email',
        html: verificationEmailTemplate(user.username as string, verificationToken)
    })
    // return user;
};

export const verifyEmail = async (token: string | string[] | undefined, ip: string, userAgent: string) => {

    const verificationToken = hashToken(token as string)
    const redisClientKey = `email_verify:${verificationToken}`
    const data = await redis.get(redisClientKey)
    if (!data) throw new AppError("Invalid or expired verification token", 400)

    const databaseToken = await repo.checkUserVerifyToken(verificationToken)
    if (!databaseToken) throw new AppError("Invalid token", 400)

    await repo.verifyUserEmail(data.userId)

    await redis.del(redisClientKey)

    await logEvent({
        userId: data.userId,
        action: AuditAction.EMAIL_VERIFIED,
        ip: ip as string,
        userAgent
    })
}


export const login = async (req: Request, next: NextFunction, data: any) => {
    const { email, password } = data
    const { ip, userAgent, device } = getClientInfo(req)
    const user = await repo.findByEmail(email);
    if (!user) throw new AppError("Invalid Credentials", 400)

    if (!user.isVerified) next(new AppError("Contact is not yet verified", 400))

    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) {
        await logEvent({
            userId: user.id,
            action: AuditAction.LOGIN_FAILED,
            severity: AuditSeverity.WARN,
            ip: ip as string,
            userAgent: userAgent as string
        })

        throw new AppError("Invalid Credentials", 401)
    }




    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await repo.createSession({
        userId: user.id,
        device,
        ip,
        userAgent,
        expiresAt
    })


    const roles = user.roles.map((r: any) => r.role.name);
    const rawPermissions = user.roles.flatMap((r: any) =>
        r.role.permissions.map((p: any) => p.permission)
    );

    const permissions = expandPermissions(rawPermissions)

    const payload = {
        id: user.id,
        sessionId: session.id,
        email: user.email,
        roles,
        permissions
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const hashedToken = hashToken(refreshToken)

    await repo.updateSessionHashToken({
        sessionId: session.id,
        hashedToken
    })

    const redisClientKey = `session:${session.id}`
    const redisClientValue = {
        userId: user.id,
        device: session.device,
        ip: session.ipAddress,
        createdAt: session.createdAt
    }

    const seconds = 7 * 24 * 60 * 60;
    await redis.set(redisClientKey, seconds, redisClientValue)


    const { password: _, ...safeUser } = user;

    await logEvent({
        userId: user.id,
        action: AuditAction.LOGIN_SUCCESS,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return {
        user: safeUser,
        accessToken,
        refreshToken
    }
}



export const oAuthCallback = async (req: Request, user: any) => {
    if (!user.isActive) {
        throw new AppError("Account deactivated", 401);
    }
    if (user.isSuspended) {
        throw new AppError("Account suspended", 401);
    }


    const { ip, userAgent, device } = getClientInfo(req)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await repo.createSession({
        userId: user.id,
        ip,
        userAgent,
        device,
        expiresAt
    })

    const payload = {
        id: user.id,
        sessionId: session.id
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const hashedToken = hashToken(refreshToken)

    await repo.updateSessionHashToken({
        sessionId: session.id,
        hashedToken
    })

    const redisClientKey = `session:${session.id}`
    const redisClientValue = {
        userId: user.id,
        device: session.device,
        ip: session.ipAddress,
        createdAt: session.createdAt
    }

    const seconds = 7 * 24 * 60 * 60;
    await redis.set(redisClientKey, seconds, redisClientValue)


    const { password: _, ...safeUser } = user;


    await logEvent({
        userId: user.id,
        action: AuditAction.LOGIN_SUCCESS,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return {
        user: safeUser,
        accessToken,
        refreshToken
    }
};


export const refreshToken = async (refreshToken: string, ip: string, userAgent: string) => {

    if (!refreshToken) throw new AppError("Unauthorized", 401)

    let decoded: any;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            throw new AppError("Session expired. Please login again", 401)
        }
        throw new AppError("Invalid token", 401)
    }

    const hashedToken = hashToken(refreshToken)

    const session = await repo.getSessionByToken(hashedToken)

    if (!session || !session.isValid) {
        await repo.invalidateAllUserSession(decoded.id)
        throw new AppError("Session compromised. Please login again", 403)
    }

    const payload = {
        id: decoded.id,
        sessionId: decoded.sessionId,
        email: decoded.email,
        roles: decoded.roles,
        permissions: decoded.permissions
    }

    const accessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    const newDecoded = verifyRefreshToken(newRefreshToken)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newHashedToken = hashToken(newRefreshToken)

    await repo.rotateSession({
        oldHashedToken: hashedToken,
        newHashedToken,
        expiresAt
    })

    await logEvent({
        userId: decoded.id,
        action: AuditAction.TOKEN_REFRESH,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return {
        accessToken,
        refreshToken: newRefreshToken
    }
}


export const forgotPassword = async (email: string, ip: string, userAgent: string) => {
    const user = await repo.findByEmail(email)

    const message = `If an account with that email exists, a reset link has been sent`;

    const resetToken = getToken()
    const hashedResetToken = hashToken(resetToken)

    if (!user) {
        return {
            message
        }
    }

    const data = {
        userId: user.id,
        resetToken: hashedResetToken
    }
    await repo.createOtpPasswordReset(data)

    const redisClientKey = `password_reset:${hashedResetToken}`;
    const seconds = 5 * 60
    await redis.set(redisClientKey, seconds, { userId: user.id })

    // Send emails-- non blocking

    console.log(resetToken)

    await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: user.email,
        subject: 'Password Reset Request',
        html: passwordResetEmailTemplate(user.username as string, resetToken)
    })

    await logEvent({
        userId: user.id,
        action: AuditAction.PASSWORD_RESET_REQUEST,
        ip: ip as string,
        userAgent: userAgent as string
    })

    return {
        message
    }

}

export const resetPassword = async (data: PasswordReset, ip: string, userAgent: string) => {
    const { password, token } = data

    const hashedToken = hashToken(token)
    const redisClientKey = `password_reset:${hashedToken}`;

    const raw = await redis.get(redisClientKey)

    if (!raw) {
        throw new AppError("Invalid or expired reset token", 400)
    }

    const databaseToken = await repo.checkUserPasswordResetToken(hashedToken)
    if (!databaseToken) throw new AppError("Invalid token", 400)

    const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS as string) || 10
    );
    const hashedPassword = await bcrypt.hash(password, salt);

    const payload = {
        userId: raw.userId,
        password: hashedPassword
    }

    await repo.updateUserPassword(payload)
    await redis.del(redisClientKey)

    await logEvent({
        userId: raw.userId,
        action: AuditAction.PASSWORD_RESET_SUCCESS,
        ip: ip as string,
        userAgent: userAgent as string
    })
}


export const logOut = async (res: Response, sessionId: string) => {
    await redis.del(`session:${sessionId}`)
    await repo.invalidateSession(sessionId)
    res.clearCookie("refreshToken")
}

export const logOutSpecificDevice = async (sessionId: string) => {
    await redis.del(`session:${sessionId}`)
    await repo.invalidateSession(sessionId)
}


export const logOutAll = async (userId: string, sessionId: string) => {
    const sessions = await repo.getAllUserSession(userId)
    if (sessions.length) {
        const keys = sessions.map(id => `session:${id}`)
        if (keys.length) {
            await redis.client.del(keys)
        }

    }
    await repo.invalidateAllUserSession(userId)
}

