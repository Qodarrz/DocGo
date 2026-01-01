const prisma = require("../db/prisma");
const { put } = require("@vercel/blob");
const { notifyUser } = require("../helper/notif");

class UserController {
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          userProfile: true,
          medicalProfile: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan",
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update data dasar user
   */

  async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, phone, dateOfBirth, gender } = req.body;
      const file = req.file;

      let userProfileUrl;

      if (file) {
        const fileName = `profile-${userId}-${Date.now()}.png`;
        const { url } = await put(fileName, file.buffer, { access: "public" });
        userProfileUrl = clear; // URL publik langsung
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          phone: phone ?? undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender ?? undefined,
          ...(userProfileUrl && { userProfile: userProfileUrl }),
        },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          userProfile: true,
          updatedAt: true,
        },
      });

      return res.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  async getMedicalProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const profile = await prisma.medicalProfile.findUnique({
        where: { userId },
      });

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buat atau update medical profile (UPSERT)
   */
  async upsertMedicalProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const {
        heightCm,
        weightKg,
        bloodType,

        allergies,
        medications,
      } = req.body;

      // ===== VALIDATION =====

      await notifyUser({
        userId: userId,
        event: "MEDICAL_UPDATE",
      });

      if (heightCm !== undefined) {
        if (typeof heightCm !== "number" || heightCm <= 0) {
          return res.status(400).json({
            success: false,
            message: "heightCm harus berupa angka dan > 0",
          });
        }
      }

      if (weightKg !== undefined) {
        if (typeof weightKg !== "number" || weightKg <= 0) {
          return res.status(400).json({
            success: false,
            message: "weightKg harus berupa angka dan > 0",
          });
        }
      }

      if (bloodType !== undefined) {
        const allowedBloodTypes = ["A", "B", "AB", "O"];
        if (!allowedBloodTypes.includes(bloodType)) {
          return res.status(400).json({
            success: false,
            message: "bloodType harus salah satu dari: A, B, AB, O",
          });
        }
      }

      if (allergies !== undefined && !Array.isArray(allergies)) {
        return res.status(400).json({
          success: false,
          message: "allergies harus berupa array",
        });
      }

      if (medications !== undefined && !Array.isArray(medications)) {
        return res.status(400).json({
          success: false,
          message: "medications harus berupa array",
        });
      }

      // ===== UPSERT =====

      const profile = await prisma.medicalProfile.upsert({
        where: { userId },
        create: {
          userId,
          heightCm,
          weightKg,
          bloodType,

          allergies,
          medications,
        },
        update: {
          heightCm,
          weightKg,
          bloodType,

          allergies,
          medications,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profil medis berhasil disimpan",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ringkasan user untuk dashboard / AI context
   */
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          medicalProfile: true,
          symptomChecks: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan",
        });
      }

      const lastCheck = user.symptomChecks[0] || null;

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
          },
          medicalProfile: user.medicalProfile,
          lastSymptomCheck: lastCheck,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
