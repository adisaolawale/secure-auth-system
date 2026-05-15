
export type UserCreate = {
    email: string,
    fullName: string,
    username: string
    paswordHash: string,
}

export type UserUpdateVerifyToken = {
    otpId: string,
    verificationToken: string,
}

export type UserUpdatePasswordReset = {
    userId: string,
    resetToken: string
}

export type SessionCreate = {
    userId: string,
    device: any,
    ip: any,
    userAgent: any,
    expiresAt: any
}

export type SessionUpdateHashToken = {
    sessionId: string,
    hashedToken: string
}

export type SessionRotate = {
    oldHashedToken: string,
    newHashedToken: string,
    expiresAt: any
}

export type PasswordReset = {
    password: string,
    token: string
}

export type UserUpdatePassword = {
    userId: string,
    password: string
}