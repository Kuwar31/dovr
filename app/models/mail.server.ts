import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendSupportEmail({
  fromName,
  fromEmail,
  shop,
  subject,
  message,
}: {
  fromName: string;
  fromEmail: string;
  shop: string;
  subject: string;
  message: string;
}) {
  const to = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "";

  await transporter.sendMail({
    from: `"DOVR App Support" <${process.env.SMTP_USER}>`,
    replyTo: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `[DOVR Support] ${subject} — ${shop}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #1a1a2e;">New Support Request</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;background:#f4f4f8">Store</td><td style="padding:8px">${shop}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f4f4f8">From</td><td style="padding:8px">${fromName} &lt;${fromEmail}&gt;</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f4f4f8">Subject</td><td style="padding:8px">${subject}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space:pre-wrap;background:#f9f9fb;padding:16px;border-radius:6px">${message}</p>
      </div>
    `,
  });
}
