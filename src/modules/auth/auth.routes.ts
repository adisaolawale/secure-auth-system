import { Router, type Request, type Response, type NextFunction } from "express";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import * as controller from "./auth.controller.js";
import { authLimiter } from "../../shared/middleware/limiters.middleware.js";
import passport from "../../shared/middleware/googlePassport.middleware.js";
import { authorizePermissions, authorizeRoles } from "../../shared/middleware/rbac.middleware.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = Router();

// ── Lazy limiter loader — cached after first request
// let _limiters: typeof import("../../shared/middleware/limiters.middleware.js") | null = null;

// async function getLimiters() {
//     if (!_limiters) {
//         _limiters = await import("../../shared/middleware/limiters.middleware.js");
//     }
//     return _limiters;
// }

// function authLimit(req: Request, res: Response, next: NextFunction) {
//     getLimiters().then((l) => l.authLimiter(req, res, next)).catch(next);
// }

// function sensitiveLimit(req: Request, res: Response, next: NextFunction) {
//     getLimiters().then((l) => l.sensitiveActionLimiter(req, res, next)).catch(next);
// }

// ── Routes
router.post("/register", authLimiter, validate(registerSchema), controller.registerController);
router.post("/verify-email/:token", controller.verifyEmailController);
// Step 1: Redirect to Google 
router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        accessType: "offline",
        prompt: "consent"
    }),
)

// Step 2: Callback
router.get(
    "/google/callback",
    passport.authenticate("google",
        { session: false }
    ),
    controller.oAuthCallbackController
)

router.post("/login",
    //authorizePermissions("user:read"),
    //authorizeRoles("ADMIN"),
    authLimiter,
    validate(loginSchema),
    controller.loginController
);

// router.post(
//     "/test",
//     protect,
//     authorizePermissions("user:create"),
//     authorizeRoles("USER"),
//     controller.loginController
// )
router.post("/refresh",
    controller.refreshTokenController
);

router.post("/forgot-password", controller.forgotPasswordController);
router.post("/reset-password/:token", controller.resetPasswordController);

router.delete("/logout",
    protect,
    controller.logoutController
)

router.delete("/logout/:sessionId",
    protect,
    controller.logoutSpecificDeviceController
)

router.delete("/logout-all",
    protect,
    controller.logoutAllController
)


export default router;