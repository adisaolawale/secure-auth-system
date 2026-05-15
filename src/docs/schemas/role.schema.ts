/**
 *  @swagger
 *  components:
 *    schemas:
 *      Role:
 *        type: object
 *        required:
 *          - id
 *          - name
 *        properties:
 *          id:
 *            type: string
 *            format: uuid
 *            example: "550e8400-e29b-41d4-a716-446655440000"
 *          name:
 *            type: string
 *            example: "MANAGER"
 *          description:
 *            type: string
 *            nullable: true
 *          isSystem:
 *            type: boolean
 *            description: Indicates if this is a protected system-level role
 *            example: false
 *          parentId:
 *            type: string
 *            format: uuid
 *            nullable: true
 *            description: The ID of the parent role in the hierarchy
 *            example: "660f9511-f30c-52e5-b827-557766551111"
 *          parent:
 *            $ref: '#/components/schemas/Role'
 *            description: Optional nested parent role object
 *          children:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Role'
 *            description: List of sub-roles inheriting from this role
 *          createdAt:
 *            type: string
 *            format: date-time
 *            example: "2026-05-07T15:24:36Z"
 */


/**
 *  @swagger
 *  components:
 *    schemas:
 *      Permission:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            format: uuid
 *          name:
 *            type: string
 *            example: "user:write"
 *          description:
 *            type: string
 *            nullable: true
 *          parentId:
 *            type: string
 *            format: uuid
 *            nullable: true
 */



/**
 *  @swagger
 *  components:
 *    schemas:
 *      AuditLog:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            format: uuid
 *          action:
 *            type: string
 *            enum: [LOGIN_SUCCESS, LOGIN_FAILED, REGISTER, ROLE_CREATED, etc]
 *          severity:
 *            type: string
 *            enum: [INFO, WARN, CRITICAL]
 *          ipAddress:
 *            type: string
 *            example: "192.168.1.1"
 *          metadata:
 *            type: object
 *            description: Flexible JSON field for event specifics
 *          createdAt:
 *            type: string
 *            format: date-time
 */

// /**
//  *  @swagger
//  *  components:
//  *    schemas:
//  *      Role:
//  *        type: object
//  *        required:
//  *          - id
//  *          - email
//  *        properties:
//  *          id:
//  *            type: string
//  *            example: "12345"
//  *          name:
//  *            type: string
//  *            example: "MANAGER"
//  *          description:
//  *            type: string
//  *            example: "Manages user"
//  *          parentId:
//  *            type: string
//  *            example: "12345"
//  *          isSystem:
//  *            type: boolean
//  *            example: false
//  *          createdAt:
//  *            type: string
//  *            format: date-time
//  */



// model Role {
//   id     String @id @default(uuid()) @db.Uuid
//   name   String @unique
//   description  String?

//   isSystem Boolean @default(false) @map("is_system")

//   parentId  String? @map("parent_id") @db.Uuid
//   parent   Role? @relation("RoleHierarchy", fields: [parentId], references: [id])
//   children Role[] @relation("RoleHierarchy")

//   createdAt DateTime @default(now()) @map("created_at")

//   users  UserRole[]
//   permissions  RolePermission[]

//   @@map("role")
// }
