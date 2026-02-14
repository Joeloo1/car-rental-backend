import { Router } from "express";
import {
  resendverifyEmail,
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logOut,
  refreshAccessToken,
} from "../../controllers/auth/auth.controller";
import { validateRequest } from "../../middleware/validation_middleware";
import { SignupSchema, LoginSchema } from "../../schema/auth.schema";
import { adminSignup } from "../../controllers/admin/admin.controller";

const router = Router();

/**
 * POST /api/auth/admin/signup
 * Create a new admin account with elevated privileges
 * Body: { email: string, password: string, name?: string }
 * Validates request against SignupSchema
 */
router.route("/admin/signup").post(validateRequest(SignupSchema), adminSignup);

/**
 * POST /api/auth/signup
 * Create a new regular user account
 * Body: { email: string, password: string, name?: string }
 * Validates request against SignupSchema
 */
router.route("/signup").post(validateRequest(SignupSchema), signup);

/**
 * POST /api/auth/login
 * Authenticate user and create session/token
 * Body: { email: string, password: string }
 * Validates request against LoginSchema
 */
router.route("/login").post(validateRequest(LoginSchema), login);

/**
 * POST /api/auth/logout
 * End user session and invalidate authentication token
 * Requires authentication
 */
router.route("/logout").post(logOut);

/**
 * GET /api/auth/verify-email
 * Confirm user's email address using verification token
 * Query: { token: string }
 */
router.route("/verify-email").get(verifyEmail);

/**
 * POST /api/auth/resend-verification-email
 * Send a new verification email if original expired or was lost
 * Body: { email: string }
 */
router.route("/resend-verification-email").post(resendverifyEmail);

/**
 * POST /api/auth/forgot-Password
 * Initiate password reset process by sending reset link to user's email
 * Body: { email: string }
 */
router.route("/forgot-Password").post(forgotPassword);

/**
 * PATCH /api/auth/reset-password/:token
 * Set new password using token received via email
 * Params: { token: string }
 * Body: { password: string }
 */
router.route("/reset-password/:token").patch(resetPassword);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using valid refresh token
 * Body: { refreshToken: string } OR Cookie: refreshToken
 * Protection: SEMI-PROTECTED (requires valid refresh token)
 */
router.route("/refresh-token").post(refreshAccessToken);

export default router;
