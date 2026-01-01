const EMAIL_EVENTS = {
  EMAIL_VERIFIED: (data) => ({
    subject: "Email Berhasil Diverifikasi",
    html: `
      <p>Email Anda telah berhasil diverifikasi.</p>
    `,
  }),

  PASSWORD_RESET_SUCCESS: () => ({
    subject: "Password Berhasil Diubah",
    html: `<p>Password Anda berhasil diubah.</p>`,
  }),

  OTP_VERIFICATION: ({ otp }) => ({
    subject: "Kode Verifikasi OTP",
    type: "otp",
    otp,
  }),

  RESET_PASSWORD: ({ resetLink, resetToken }) => ({
    subject: "Reset Password",
    type: "reset",
    resetLink,
    resetToken,
  }),
};

module.exports = { EMAIL_EVENTS };
