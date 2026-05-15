import { prisma } from "../src/shared/config/prismaClient.config.js";
import logger from "../src/shared/utils/logger.js";


export async function main() {
    const permissions = [
        { name: "user:manage" },
        { name: "user:create" },
        { name: "user:read" },
        { name: "user:update" },
        { name: "user:delete" },

        { name: "role:manage" },
        { name: "role:create" },
        { name: "role:update" },
        { name: "role:assign" },

        { name: "post:manage" },
        { name: "post:create" },
        { name: "post:delete" }
    ]
    for (const per of permissions) {
        await prisma.permission.upsert({
            where: { name: per.name },
            update: {},
            create: {
                name: per.name,
                isSystem: true
            }
        })
    }


    // STEP 2: Create hierarchy relationships

    const get = async (name: string) => prisma.permission.findUnique({ where: { name } })

    const setParent = async (child: string, parent: string) => {
        const childPerm = await get(child);
        const parentPerm = await get(parent)

        await prisma.permission.update({
            where: { id: childPerm!.id },
            data: {
                parentId: parentPerm!.id
            }
        });
    };


    // USER hierarchy
    await setParent("user:create", "user:manage")
    await setParent("user:read", "user:manage")
    await setParent("user:update", "user:manage")
    await setParent("user:delete", "user:manage")


    // ROLE hierarchy
    await setParent("role:create", "role:manage")
    await setParent("role:update", "role:manage")
    await setParent("role:assign", "role:manage")


    // POST hierarchy
    await setParent("post:create", "post:manage")
    await setParent("post:delete", "post:manage")

    // STEP 3: Create roles

    // const permissions = await prisma.permission.createMany({
    //     data: [
    //         {name: "user:manage"},
    //         { name: "user:create" },
    //         { name: "user:read" },
    //         { name: "user:update" },
    //         { name: "user:delete" },

    //         {name: "role:manage"},
    //         { name: "role:create" },
    //         { name: "role:update" },
    //         { name: "role:assign" },

    //         {name: "post:manage"},
    //         { name: "post:create" },
    //         { name: "post:delete" }
    //     ],
    //     skipDuplicates: true
    // });

    const allPermissions = await prisma.permission.findMany();

    const perMap = Object.fromEntries(
        allPermissions.map(p => [p.name, p.id])
    );

    const superAdmin = await prisma.role.upsert({
        where: { name: "SUPER_ADMIN" },
        update: {},
        create: {
            name: "SUPER_ADMIN",
            isSystem: true
        }
    });

    const admin = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
            isSystem: true
        }
    });

    const user = await prisma.role.upsert({
        where: { name: "USER" },
        update: {},
        create: {
            name: "USER",
            isSystem: true
        }
    });

    const assign = async (roleId: string, perms: string[]) => {
        for (const p of perms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId,
                        permissionId: perMap[p] as string
                    }
                },
                update: {},
                create: {
                    roleId,
                    permissionId: perMap[p] as string
                }
            });
        }
    };


    await assign(
        superAdmin.id, [
        "user:manage",
        "role:manage",
        "post:manage"
    ]
    )

    await assign(admin.id, [
        "user:manage",
        "post:manage",
        "role:create"
    ])

    await assign(user.id, [
        "user:read",
        "post:create"
    ])


    logger.info("Seed completed")

}