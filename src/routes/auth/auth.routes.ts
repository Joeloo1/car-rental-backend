import { Router } from "express";
import {
  resendverifyEmail,
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logOut,
} from "../../controllers/auth/auth.controller";
import { validateRequest } from "../../middleware/validation_middleware";
import { SignupSchema, LoginSchema } from "../../schema/auth.schema";
import { adminSignup } from "../../controllers/admin/admin.controller";

const router = Router();

router.route("/admin/signup").post(validateRequest(SignupSchema), adminSignup);
router.route("/signup").post(validateRequest(SignupSchema), signup);
router.route("/login").post(validateRequest(LoginSchema), login);
router.route("/logout").post(logOut);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification-email").post(resendverifyEmail);
router.route("/forgot-Password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

export default router;
