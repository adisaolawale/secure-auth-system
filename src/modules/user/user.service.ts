import bcrypt from "bcryptjs";
import AppError from "../../shared/utils/appError.js";
import * as repo from "./user.repository.js"


export const getMe = async (userId: string) => {
    const result = await repo.getMe(userId)
    return result
};


export const getUserById = async (id: string) => {
    const result = await repo.getUserById(id)
    return result
}

export const updateProfile = async (userId: string, data: any) => {
    const result = repo.update(userId, data)
    return result
}

export const updateAvatar = async (userId: string, avatar: string) => {
    const result = repo.update(userId, { avatar })
    return result
}

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await repo.getUserByIdForVerification(userId)

    if (!user || !user.password) throw new AppError("User not found", 404)

    const isValid = await bcrypt.compare(user.password, currentPassword)

    if (!isValid) throw new AppError("Invalid current password", 404)

    const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS as string) || 10
    );
    const password = bcrypt.hash(newPassword, salt)

    const result = await repo.update(userId, { password })

}


export const searchUsers = async (query: string) => {
    const result = await repo.searchUsers(query)
    return result
}

export const deactivateAccount = async (userId: string) => {
    const result = await repo.deactivateAccount(userId)
    return result
} 