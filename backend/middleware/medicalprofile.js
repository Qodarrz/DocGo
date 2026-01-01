const prisma = require("../db/prisma");

async function requireMedicalProfile(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { medicalProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan"
      });
    }

    if (!user.medicalProfile) {
      return res.status(400).json({
        success: false,
        message: "Profil medis belum dilengkapi. Silakan lengkapi terlebih dahulu."
      });
    }

    req.medicalUser = user;

    next();
  } catch (error) {
    console.error("[Middleware] requireMedicalProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada validasi profil medis"
    });
  }
}

module.exports = requireMedicalProfile;
