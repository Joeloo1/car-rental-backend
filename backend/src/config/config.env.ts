import dotenv from "dotenv";

dotenv.config();

const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_ACCESS_TOKEN_SECRET",
  "JWT_REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_EXPIRY",
  "VERIFICATION_SECRET",
  "CSRF_SECRET",
  "SESSION_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CLIENT_URL",
  "SERVER_URL",
  "EMAIL_HOST",
  "EMAIL_USER",
  "EMAIL_PASS",
  "PAYSTACK_SECRET_KEY",
] as const;

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET!,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY!,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY!,
  CSRF_SECRET: process.env.CSRF_SECRET!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  ADMIN_SIGNUP_SECRET: process.env.ADMIN_SIGNUP_SECRET!,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  VERIFICATION_SECRET: process.env.VERIFICATION_SECRET!,
  CLIENT_URL: process.env.CLIENT_URL,
  SERVER_URL: process.env.SERVER_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
  REDIS_URL: process.env.REDIS_URL,
  SERVICE_FEE: Number(process.env.SERVICE_FEE ?? 65),
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ?? "",
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim()),
};

export default config;
