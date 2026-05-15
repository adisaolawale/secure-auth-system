// import { pool, transaction } from "../../shared/config/db.config.js";

import { prisma } from "../../shared/config/prismaClient.config.js";
import type { SessionCreate, SessionRotate, SessionUpdateHashToken, UserCreate, UserUpdatePassword, UserUpdatePasswordReset, UserUpdateVerifyToken } from "./auth.type.js";


export const registerUser = async (data: {
    email: string;
    passwordHash: string;
    fullName: string;
    username: string;
    ipAddress: string;
    userAgent: string;
    verificationToken: string;
}) => {
    const { email, passwordHash, fullName, username, ipAddress, userAgent, verificationToken } = data;

    // 1. Create user
    const userRes = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            fullName,
            username
        }
    });

    // 2. Create OTP row
    await prisma.oTP.create({
        data: {
            userId: userRes.id,
            codeHash: verificationToken as string,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
            type: "EMAIL_VERIFICATION"
        }
    });


    const user = userRes;
    return user;
};



export const checkUserVerifyToken = async (token: string) => {
    const result = await prisma.oTP.findFirst({
        where: {
            codeHash: token
        }
    });
    return result
}



export const updateUserVerificationToken = async (data: UserUpdateVerifyToken) => {

    const { otpId, verificationToken } = data
    await prisma.oTP.update({
        where: { id: otpId },
        data: { codeHash: verificationToken }
    })
}


export const createOtpPasswordReset = async (data: UserUpdatePasswordReset) => {
    const { userId, resetToken } = data
    await prisma.oTP.create({
        data: {
            userId: userId,
            codeHash: resetToken,
            type: "PASSWORD_RESET",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
        }
    })
}


export const checkUserPasswordResetToken = async (token: string) => {
    const result = await prisma.oTP.findFirst({
        where: {
            codeHash: token
        }
    });
    return result;
}

export const updateUserPassword = async (data: UserUpdatePassword) => {
    const { userId, password } = data
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: password
        }
    });
}




export const verifyUserEmail = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            isVerified: true
        }
    });
}



export const findByEmail = async (email: string) => {
    // const query = `
    //   SELECT
    //   u.id,
    //   u.email,
    //   u.password_hash,
    //   u.username,
    //   u.full_name,
    //   u.avatar_url,
    //   u.bio,
    //   u.gender,
    //   u.date_of_birth,
    //   u.last_email_edit,
    //   u.last_username_edit,
    //   u.profession,
    //   u.role,
    //   u.is_email_verified,
    //   u.is_active,
    //   u.is_suspended,
    //   u.last_seen,
    //   u.has_active_listing,
    //   u.created_at,
    //   u.updated_at,
    //   -- Identities as JSON array
    //   COALESCE(
    //     json_agg(
    //       json_build_object(
    //         'id',         i.id,
    //         'name',       i.name,
    //         'icon',       ic.lucide_icon, 
    //         'type',       i.type,
    //         'isActive',   i.is_active,
    //         'customText', ui.custom_text
    //       )
    //     ) FILTER (WHERE i.id IS NOT NULL),
    //     '[]'
    //   ) AS identities
    // FROM users u
    // LEFT JOIN user_identities ui ON ui.user_id = u.id
    // LEFT JOIN identities i       ON i.id = ui.identity_id
    // LEFT JOIN identity_categories ic ON ic.id = i.category_id
    // WHERE u.email = $1
    //   AND u.is_active = true
    // GROUP BY u.id
    // `;

    // const result = await pool.query(query, [email]);
    // return result.rows[0]

    const result = await prisma.user.findUnique({
        where: { email },
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: {
                                        include: {
                                            children: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return result;
}

export const findRoleByName = async (name: string) => {
    const result = await prisma.role.findFirst({
        where: { name }
    })

    return result;
}

export const addRoleToUser = async (roleId: string, userId: string) => {
    await prisma.userRole.create({
        data: {
            userId,
            roleId
        }
    })
}

export const updateUserLastSeen = async (userId: string) => {

    await prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() }
    });
}

export const createSession = async (data: SessionCreate) => {
    const {
        userId,
        device,
        ip,
        userAgent,
        expiresAt
    } = data
    const session = await prisma.session.create({
        data: {
            userId,
            ipAddress: ip as string,
            userAgent: userAgent as string,
            expiresAt: expiresAt as string,
            device: device as string
        }
    });
    return session;
}



export const updateSessionHashToken = async (data: SessionUpdateHashToken) => {

    const { sessionId, hashedToken } = data

    await prisma.session.update({
        where: { id: sessionId },
        data: { tokenHash: hashedToken }
    });
}

export const getSessionByToken = async (hashedToken: string) => {

    const result = await prisma.session.findFirst({
        where: { tokenHash: hashedToken }
    });
    return result;
}

export const getAllUserSession = async (userId: string) => {
    const sessions = await prisma.session.findMany({
        where: { userId, isValid: true },
        select: { id: true }
    })

    return sessions.map(s => s.id);
}

export const invalidateSession = async (sessionId: string) => {
    await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
    })
}

export const invalidateAllUserSession = async (userId: string) => {

    await prisma.session.updateMany({
        where: { userId },
        data: { isValid: false }
    });
}

export const rotateSession = async (data: SessionRotate) => {
    const { oldHashedToken, newHashedToken, expiresAt } = data

    // 1. Find old session
    const oldSessionRes = await prisma.session.findFirst({
        where: { tokenHash: oldHashedToken }
    });
    const oldSession = oldSessionRes;

    if (!oldSession || !oldSession.isValid) {
        throw new Error("Invalid or reused refresh token");
    }

    // 2. Invalidate old session

    await prisma.session.update({
        where: { id: oldSession.id },
        data: { isValid: false }
    });


    const newSessionRes = await prisma.session.create({
        data: {
            userId: oldSession.userId,
            tokenHash: newHashedToken,
            device: oldSession.device,
            ipAddress: oldSession.ipAddress,
            userAgent: oldSession.userAgent,
            expiresAt: expiresAt as string
        }
    });




    return newSessionRes;
}




