import { Router } from "express";

import * as controller from "./user.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { authorizePermissions } from "../../shared/middleware/rbac.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js";


const router = Router()


router.get("/me",
    protect,
    controller.getMe
)


router.patch("/me",
    protect,
    authorizePermissions("user:update"),
    validate(updateProfileSchema),
    controller.updateProfile
)

router.patch("/me/password",
    protect,
    authorizePermissions("user:update"),
    validate(changePasswordSchema),
    controller.changePassword
)


router.get("/search",
    controller.searchUsers
)


router.delete("/me",
    protect,
    authorizePermissions("user:delete"),
    controller.deactivateAccount
)


export default router;