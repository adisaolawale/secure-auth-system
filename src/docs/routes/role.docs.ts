

/**
 * @swagger
 *  tags:
 *    name: Role
 *    description: Role-Based Access Control (RBAC) and Permission Management
 */

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Create a new role with permissions
 *     description: Creates a new role and links it to existing permissions. Requires 'role:create' permission.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permission
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name for the role
 *                 example: "SUPERVISOR"
 *               description:
 *                 type: string
 *                 description: Brief description of the role responsibilities
 *                 example: "Can oversee user activities and generate reports"
 *               permission:
 *                 type: array
 *                 description: List of permission names to attach to this role
 *                 items:
 *                   type: string
 *                   example: "user:read"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad Request (e.g., Role already exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /role/assign-permission:
 *   post:
 *     summary: Assign a specific permission to an existing role
 *     description: Directly links a permission ID to a role ID. Requires 'role:update' permission.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               permissionId:
 *                 type: string
 *                 format: uuid
 *                 example: "770f8511-f30c-52e5-b827-557766551111"
 *     responses:
 *       201:
 *         description: Permission assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Permission assigned to role successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     roleId: { type: string, format: uuid }
 *                     permissionId: { type: string, format: uuid }
 *       403:
 *         description: Forbidden - Cannot modify system roles
 *       404:
 *         description: Role or Permission not found
 */