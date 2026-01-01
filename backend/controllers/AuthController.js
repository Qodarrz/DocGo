const prisma = require("../db/prisma");
const { hashPassword, comparePassword } = require("../helper/hash");
const { signToken } = require("../helper/jwt");
const { generateOTP, hashOTP } = require("../helper/otp");
const { notifyUser } = require("../helper/notif");
const { sendEmailByEvent } = require("../helper/emaildispatcher");

const crypto = require("crypto");

const {
  sendOTP: sendOTPEmail,
  sendResetPassword,
  sendNotification,
} = require("../helper/smtpgmail");

const APP_NAME = process.env.APP_NAME || "Aplikasi Kita";

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
          where: { email },
          data: { otpHash, otpExpiresAt },
        });

        await sendEmailByEvent({
          event: "OTP_VERIFICATION",
          email: existingUser.email,
          data: { otp },
        });

        return res.status(200).json({
          code: "email_pending_verification",
          message: "Email sudah terdaftar tapi belum verifikasi OTP",
          email: existingUser.email,
        });
      } else {
        return res.status(409).json({
          message: "Email sudah terdaftar",
        });
      }
    }

    const passwordHash = await hashPassword(password);

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: false,
        otpHash,
        otpExpiresAt,
      },
    });

    await sendEmailByEvent({
      event: "OTP_VERIFICATION",
      email: user.email,
      data: { otp },
    });

    const token = signToken({ userId: user.id });

    return res.status(201).json({
      message: "Registrasi berhasil! Silakan cek email untuk verifikasi",
      token,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Email belum diverifikasi. Silakan cek email Anda untuk kode verifikasi.",
        needsVerification: true,
        email: user.email,
      });
    }

    const token = signToken({ userId: user.id, Role: user.role });

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const registerDeviceToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res
        .status(400)
        .json({ message: "userId dan fcmToken wajib diisi" });
    }

    await prisma.deviceToken.upsert({
      where: { fcmToken },
      update: { userId },
      create: { userId, fcmToken },
    });

    return res.json({
      success: true,
      message: "Device token berhasil disimpan",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email dan OTP wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP tidak valid atau sudah digunakan",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP sudah kadaluarsa",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.otpHash) {
      return res.status(400).json({
        message: "OTP salah",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    // Kirim notifikasi sukses verifikasi
    await notifyUser({
      userId: user.id,
      event: "EMAIL_VERIFIED",
    });

    await sendEmailByEvent({
      event: "EMAIL_VERIFIED",
      email: user.email,
    });

    return res.json({
      message: "Email berhasil diverifikasi! Selamat bergabung.",
      verified: true,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email sudah diverifikasi",
      });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash,
        otpExpiresAt,
      },
    });

    await sendEmailByEvent({
      event: "OTP_VERIFICATION",
      email: user.email,
      data: { otp },
    });

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Gagal mengirim OTP. Silakan coba lagi.",
      });
    }

    return res.json({
      message: "Kode OTP baru telah dikirim ke email Anda",
      expiresAt: otpExpiresAt,
      emailSent: true,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return success even if user doesn't exist (for security)
    if (!user) {
      return res.json({
        message: "Jika email terdaftar, instruksi reset password akan dikirim",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Email belum diverifikasi. Verifikasi email terlebih dahulu.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Save reset token ke database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    // Buat reset link
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    // Kirim email reset password dengan template
    const emailResult = await sendResetPassword({
      email: email,
      resetLink: resetLink,
      resetToken: resetToken,
      subject: `Reset Password - ${APP_NAME}`,
      appName: APP_NAME,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Gagal mengirim email reset password",
      });
    }

    return res.json({
      message: "Instruksi reset password telah dikirim ke email Anda",
      expiresAt: resetTokenExpiresAt,
      emailSent: true,
    });
  } catch (err) {
    console.error("Request password reset error:", err);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password baru, dan konfirmasi password wajib diisi",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Password dan konfirmasi password tidak sama",
      });
    }

    // Hash token untuk dicocokkan dengan database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: {
          gt: new Date(), // Cek apakah token masih berlaku
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token reset password tidak valid atau sudah kadaluarsa",
      });
    }

    // Hash password baru
    const passwordHash = await hashPassword(newPassword);

    // Update password dan hapus reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    // Kirim notifikasi password berhasil diubah
    await sendNotification({
      email: user.email,
      subject: "Password Berhasil Diubah",
      message: `
        Password akun Anda telah berhasil diubah.<br><br>
        Jika Anda tidak melakukan perubahan ini, segera hubungi support kami.<br>
        Untuk keamanan, jangan bagikan password Anda kepada siapa pun.
      `,
      appName: APP_NAME,
      type: "success",
    });

    return res.json({
      message: "Password berhasil direset. Silakan login dengan password baru.",
      success: true,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const checkResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Token wajib diisi",
      });
    }

    // Hash token untuk dicocokkan dengan database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        resetTokenExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token reset password tidak valid atau sudah kadaluarsa",
        valid: false,
      });
    }

    return res.json({
      message: "Token valid",
      valid: true,
      email: user.email,
      expiresAt: user.resetTokenExpiresAt,
    });
  } catch (err) {
    console.error("Check reset token error:", err);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendOtp,
  requestPasswordReset,
  resetPassword,
  checkResetToken,
  registerDeviceToken,
};