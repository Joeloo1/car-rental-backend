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
export const getVerificationEmailHtml = (
  verifyUrl: string,
  firstName: string,
): string => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f9fafb; border-radius: 12px;">
    <h2 style="color: #1e293b; text-align: center;">🔐 Verify Your Email</h2>
    <p style="color: #475569; text-align: center;">
      Hi <strong>${firstName}</strong>! 👋<br/>
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

export const generatePasswordResetEmail = (resetURL: string, email: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Reset Request</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🔐 Password Reset
              </h1>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <!-- Main Message -->
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your account associated with <strong style="color: #2d3748;">${email}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                Click the button below to create a new password. This link will expire in <strong>10 minutes</strong> for security reasons.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${resetURL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;"
                       target="_blank">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #4a5568; font-size: 13px; line-height: 1.5;">
                      If the button above doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${resetURL}" 
                         style="color: #667eea; text-decoration: none; font-size: 13px;"
                         target="_blank">
                        ${resetURL}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left: 4px solid #f6ad55; background-color: #fffaf0; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #744210; font-size: 14px; line-height: 1.5;">
                      <strong>⚠️ Security Alert:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Additional Info -->
              <p style="margin: 0 0 10px; color: #718096; font-size: 14px; line-height: 1.6;">
                For your security:
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #718096; font-size: 14px; line-height: 1.8;">
                <li>This link expires in 10 minutes</li>
                <li>The link can only be used once</li>
                <li>Never share this link with anyone</li>
              </ul>
              
              <!-- Signature -->
              <p style="margin: 30px 0 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                Best regards,<br/>
                <strong style="color: #2d3748;">The Support Team</strong>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                This is an automated message, please do not reply to this email.
              </p>
              
              <p style="margin: 0 0 15px; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                If you need assistance, contact us at 
                <a href="mailto:support@yourcompany.com" style="color: #667eea; text-decoration: none;">support@yourcompany.com</a>
              </p>
              
              <!-- Social Links (Optional) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 15px auto 0;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://twitter.com/yourcompany" style="color: #a0aec0; text-decoration: none; font-size: 12px;">Twitter</a>
                  </td>
                  <td style="padding: 0 8px; color: #cbd5e0;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="https://facebook.com/yourcompany" style="color: #a0aec0; text-decoration: none; font-size: 12px;">Facebook</a>
                  </td>
                  <td style="padding: 0 8px; color: #cbd5e0;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="https://yourcompany.com" style="color: #a0aec0; text-decoration: none; font-size: 12px;">Website</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #cbd5e0; font-size: 12px;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </p>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
};
