const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("❌ Email send error:", error);
    throw new Error(error.message);
  }

  return data;
};

/* ======================================================
   TEMPLATES
====================================================== */
const generateOTPTemplate = (
  otp,
  appName = "DocGo",
  purpose = "verifikasi email"
) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'SFProDisplay', sans-serif; background:#f5f5f5; }
.container { max-width:600px; margin:auto; background:#fff; border-radius:12px; }
.header { background:#667eea; color:#fff; padding:30px; text-align:center; }
.content { padding:40px; color:#333; }
.otp-box {
  background:#2196f3; color:#fff; font-size:42px;
  font-weight:bold; text-align:center;
  padding:25px; border-radius:10px;
  letter-spacing:15px;
}
.footer { background:#f8f9fa; padding:20px; text-align:center; color:#6c757d; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${appName}</h1>
    <p>Kode ${purpose}</p>
  </div>
  <div class="content">
    <p>Gunakan kode OTP berikut:</p>
    <div class="otp-box">${otp}</div>
    <p><strong>⚠️ Berlaku 10 menit. Jangan bagikan.</strong></p>
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} ${appName}
  </div>
</div>
</body>
</html>
`;

const generateResetPasswordTemplate = (
  resetLink,
  resetToken,
  appName = "DocGo"
) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'SFProDisplay', sans-serif; background:#f5f5f5; }
.container { max-width:600px; margin:auto; background:#fff; border-radius:12px; }
.header { background:#ff9a9e; padding:30px; text-align:center; }
.content { padding:40px; }
.btn {
  background:#667eea; color:#fff;
  padding:14px 32px; border-radius:50px;
  text-decoration:none; display:inline-block;
}
.token { background:#f8f9fa; padding:15px; font-family:monospace; }
.footer { background:#f8f9fa; padding:20px; text-align:center; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Reset Password</h1>
    <p>${appName}</p>
  </div>
  <div class="content">
    <p>Klik tombol berikut:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p>Atau gunakan token:</p>
    <div class="token">${resetToken}</div>
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} ${appName}
  </div>
</div>
</body>
</html>
`;

/* ======================================================
   SENDERS (SIGNATURE TETAP)
====================================================== */
const sendOTP = async ({
  email,
  otp,
  subject = "Kode Verifikasi OTP",
  appName = "DocGo",
  purpose = "verifikasi email",
}) => {
  const html = generateOTPTemplate(otp, appName, purpose);
  await sendMail({ to: email, subject, html });
  return { success: true };
};

const sendResetPassword = async ({
  email,
  resetLink,
  resetToken,
  subject = "Reset Password",
  appName = "DocGo",
}) => {
  const html = generateResetPasswordTemplate(resetLink, resetToken, appName);
  await sendMail({ to: email, subject, html });
  return { success: true };
};

const sendNotification = async ({
  email,
  subject,
  message,
  appName = "DocGo",
}) => {
  const html = `
  <html>
  <body>
    <h2>${subject}</h2>
    <p>${message}</p>
    <p>${appName} © ${new Date().getFullYear()}</p>
  </body>
  </html>`;
  await sendMail({ to: email, subject, html });
  return { success: true };
};

const sendEmail = async ({ to, subject, html }) => {
  await sendMail({ to, subject, html });
  return { success: true };
};

/* ======================================================
   EXPORT
====================================================== */
module.exports = {
  sendOTP,
  sendResetPassword,
  sendNotification,
  sendEmail,
  generateOTPTemplate,
  generateResetPasswordTemplate,
};
