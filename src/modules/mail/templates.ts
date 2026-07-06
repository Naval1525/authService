import { env } from "../../config/env.js";

const layout = (title: string, body: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #111;">${title}</h2>
    ${body}
    <p style="color: #888; font-size: 12px; margin-top: 32px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

const button = (url: string, label: string) => `
  <p style="margin: 24px 0;">
    <a href="${url}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none;">
      ${label}
    </a>
  </p>
  <p style="color: #555; font-size: 13px;">Or copy this link: ${url}</p>
`;

export const verificationEmail = (name: string, token: string) => {
  const url = `${env.APP_URL}/api/v1/auth/verify-email?token=${token}`;
  return {
    subject: "Verify your email",
    text: `Hi ${name},\n\nVerify your email by opening this link (valid for 24 hours):\n${url}`,
    html: layout(
      "Verify your email",
      `<p>Hi ${name},</p>
       <p>Confirm your email address to activate your account. This link is valid for 24 hours.</p>
       ${button(url, "Verify email")}`
    ),
  };
};

export const passwordResetEmail = (name: string, token: string) => {
  const url = `${env.APP_URL}/api/v1/auth/reset-password?token=${token}`;
  return {
    subject: "Reset your password",
    text: `Hi ${name},\n\nReset your password by opening this link (valid for 1 hour):\n${url}`,
    html: layout(
      "Reset your password",
      `<p>Hi ${name},</p>
       <p>We received a request to reset your password. This link is valid for 1 hour.</p>
       ${button(url, "Reset password")}`
    ),
  };
};

export const passwordChangedEmail = (name: string) => {
  return {
    subject: "Your password was changed",
    text: `Hi ${name},\n\nYour password was just changed. If this wasn't you, reset your password immediately.`,
    html: layout(
      "Your password was changed",
      `<p>Hi ${name},</p>
       <p>Your password was just changed and all other sessions were logged out. If this wasn't you, reset your password immediately.</p>`
    ),
  };
};
