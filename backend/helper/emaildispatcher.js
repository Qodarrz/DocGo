const {
  sendOTP,
  sendResetPassword,
  sendNotification,
} = require("./smtpgmail");
const { EMAIL_EVENTS } = require("./emailtemplates");

async function sendEmailByEvent({ event, email, data = {} }) {
  const template = EMAIL_EVENTS[event];
  if (!template) throw new Error(`Unknown email event: ${event}`);

  const payload = template(data);

  // OTP
  if (payload.type === "otp") {
    return sendOTP({
      email,
      otp: payload.otp,
      subject: payload.subject,
    });
  }

  // Reset password
  if (payload.type === "reset") {
    return sendResetPassword({
      email,
      resetLink: payload.resetLink,
      resetToken: payload.resetToken,
      subject: payload.subject,
    });
  }

  // Generic email
  return sendNotification({
    email,
    subject: payload.subject,
    message: payload.html,
    type: "info",
  });
}

module.exports = { sendEmailByEvent };
