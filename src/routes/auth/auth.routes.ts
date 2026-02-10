import { Router } from "express";
import {
  resendverifyEmail,
  signup,
  verifyEmail,
} from "../../controllers/auth/auth.controller";
import { validateRequest } from "../../middleware/validation_middleware";
import { SignupSchema } from "../../schema/auth.schema";

const router = Router();

router.route("/signup").post(validateRequest(SignupSchema), signup);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification-email").post(resendverifyEmail);

export default router;
