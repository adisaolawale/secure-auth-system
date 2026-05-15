import { Router, type Request, type Response, type NextFunction } from "express";
import * as controller from "./role.controller.js"
import { protect } from "../../shared/middleware/auth.middleware.js";
import { authorizePermissions } from "../../shared/middleware/rbac.middleware.js";


const router = Router();

router.post(
    "/",
    protect,
    authorizePermissions("role:create"),
    controller.createRole
)

router.post(
    "/assign-permission",
    protect,
    authorizePermissions("role:update"),
    controller.assignPermission
)

export default router;
