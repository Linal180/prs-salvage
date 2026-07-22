import nodemailer from "nodemailer";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const MAIL_FROM = process.env.MAIL_FROM ?? "PRS Platform <noreply@prs.local>";

export type SendMailResult = {
  delivered: boolean;
  previewUrl?: string;
  /** Dev-only convenience when SMTP is not configured */
  logged: boolean;
};

function hasSmtpConfig() {
  // Host alone is enough (MailDev / Mailpit need no auth)
  return Boolean(process.env.SMTP_HOST);
}

async function getTransport() {
  if (!hasSmtpConfig()) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
    tls: { rejectUnauthorized: false },
  });
}

export function verificationLink(rawToken: string) {
  return `${WEB_ORIGIN}/verify-email/confirm?token=${encodeURIComponent(rawToken)}`;
}

export async function sendVerificationEmail(opts: {
  to: string;
  displayName: string;
  rawToken: string;
}): Promise<SendMailResult> {
  const link = verificationLink(opts.rawToken);
  const subject = "Verify your PRS email address";
  const name = escapeHtml(opts.displayName);

  const text = [
    `Hi ${opts.displayName},`,
    "",
    "Welcome to PRS — Salvage Vehicle Auction Platform.",
    "Please verify your email by opening this link:",
    link,
    "",
    "This link expires in 24 hours.",
    "If you did not create an account, you can ignore this email.",
  ].join("\n");

  // Full HTML document + target=_blank so MailDev preview does not navigate away
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Verify your PRS email</title>
</head>
<body style="margin:0;padding:24px;background:#f7fbf8;font-family:Arial,Helvetica,sans-serif;color:#14201a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d7e5db;border-radius:8px;">
    <tr>
      <td style="padding:28px 28px 8px 28px;">
        <div style="font-size:22px;font-weight:700;color:#1b6b3a;">PRS</div>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 28px 28px;font-size:15px;line-height:1.55;">
        <p style="margin:0 0 12px 0;">Hi ${name},</p>
        <p style="margin:0 0 12px 0;">Welcome to <strong>PRS — Salvage Vehicle Auction Platform</strong>.</p>
        <p style="margin:0 0 20px 0;">Please verify your email address to continue:</p>
        <p style="margin:0 0 20px 0;">
          <a href="${link}" target="_blank" rel="noopener noreferrer"
             style="background:#1b6b3a;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;">
            Verify email
          </a>
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#5a6b61;">
          Or copy this link into your browser:
        </p>
        <p style="margin:0 0 16px 0;font-size:12px;color:#1b6b3a;word-break:break-all;">${link}</p>
        <p style="margin:0;font-size:13px;color:#5a6b61;">This link expires in 24 hours.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transport = await getTransport();
  if (!transport) {
    console.info("\n[PRS mail · development] Verification email (SMTP not configured)");
    console.info(`  To:   ${opts.to}`);
    console.info(`  Link: ${link}\n`);
    console.info("  Tip: run `npm run dev:mail` and set SMTP_HOST=127.0.0.1 SMTP_PORT=1025\n");
    return { delivered: false, logged: true, previewUrl: link };
  }

  try {
    const info = await transport.sendMail({
      from: MAIL_FROM,
      to: opts.to,
      subject,
      text,
      html,
    });

    console.info(`[PRS mail] Sent verification to ${opts.to} (messageId: ${info.messageId})`);
    console.info(`  Inbox: http://localhost:1080  (MailDev)`);

    return {
      delivered: true,
      logged: false,
      previewUrl: link,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[PRS mail] SMTP send failed (${message}) — logging link instead`);
    console.info(`  To:   ${opts.to}`);
    console.info(`  Link: ${link}\n`);
    return { delivered: false, logged: true, previewUrl: link };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
