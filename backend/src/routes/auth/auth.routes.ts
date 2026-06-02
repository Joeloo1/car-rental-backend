import { Router } from "express";
import passport from "passport";
import {
  resendverifyEmail,
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logOut,
  logOutAll,
  refreshAccessToken,
} from "../../controllers/auth/auth.controller";
import {
  googleAuthCallback,
  googleAuthFailure,
  getCurrentUser,
} from "../../controllers/auth/google.oauth.controller";
import { validateRequest } from "../../middleware/validation_middleware";
import { SignupSchema, LoginSchema, ResetPasswordSchema } from "../../schema/auth.schema";
import { adminSignup } from "../../controllers/admin/admin.controller";
import { protect } from "../../middleware/protect.middleware";

const router: Router = Router();

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
router.route("/logout").post(protect, logOut);
router.route("/logout-all").post(protect, logOutAll);

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
router.route("/reset-password/:token").patch(validateRequest(ResetPasswordSchema), resetPassword);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using valid refresh token
 * Body: { refreshToken: string } OR Cookie: refreshToken
 * Protection: SEMI-PROTECTED (requires valid refresh token)
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * GET /api/auth/google
 * Initiate Google OAuth login flow
 * Redirects to Google consent screen
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback URL
 * Called by Google after user grants permission
 * Sets cookies and redirects to frontend with tokens
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
  }),
  googleAuthCallback,
);

/**
 * GET /api/auth/google/failure
 * Google OAuth failure redirect
 * Redirects to frontend with error
 */
router.get("/google/failure", googleAuthFailure);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: Valid session or authentication token
 */
router.get("/me", protect, getCurrentUser);

export default router;
