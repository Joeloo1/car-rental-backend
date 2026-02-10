import nodemailer from "nodemailer";

import config from "../config/config.env";
import logger from "../config/winston";

interface EmmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async function (
  options: EmmailOptions,
): Promise<void> {
  /*
   * Create Transporter
   */
  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: Number(config.EMAIL_PORT),
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  // define the email options
  const mailOptions = {
    from: `"Auth_system" <${config.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  logger.info(`Email sent to : ${options.email}`);

  // send the mail here
  await transporter.sendMail(mailOptions);
};

// ─── Pre-built: Verification Email Template ────────────────────────────────
export const getVerificationEmailHtml = (verifyUrl: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f9fafb; border-radius: 12px;">
    <h2 style="color: #1e293b; text-align: center;">🔐 Verify Your Email</h2>
    <p style="color: #475569; text-align: center;">
      Thanks for signing up! Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}"
         style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
        Verify Email
      </a>
    </div>
    <p style="color: #94a3b8; text-align: center; font-size: 13px;">
      This link will expire in <strong>1 hour</strong>.<br/>
      If you did not create an account, please ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="color: #cbd5e1; text-align: center; font-size: 12px;">
      If the button doesn't work, copy and paste this link:<br/>
      <a href="${verifyUrl}" style="color: #4f46e5; word-break: break-all;">${verifyUrl}</a>
    </p>
  </div>
`;
