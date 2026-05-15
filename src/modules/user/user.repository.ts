import { prisma } from "../../shared/config/prismaClient.config.js";


export const getMe = async (userId: string) => {
    const result = prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            createdAt: true
        },
    });

    return result
};

export const getUserById = async (id: string) => {
    const result = prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true
        },
    });

    return result
}

export const getUserByIdForVerification = async (id: string) => {
    const result = prisma.user.findUnique({
        where: { id }
    });

    return result
}

export const update = async (userId: string, data: any) => {
    const result = prisma.user.update({
        where: { id: userId },
        data
    })

    return result
};

export const searchUsers = async (query: string) => {
    const result = prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ],
            isActive: true
        },
        take: 20
    })
}

export const deactivateAccount = async (userId: string) => {
    const result = prisma.user.update({
        where: { id: userId },
        data: {
            isActive: false,
        }
    })
}

