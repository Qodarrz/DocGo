const prisma = require("../db/prisma");
const { put } = require("@vercel/blob");
const bcrypt = require("bcryptjs");

class DoctorController {
  async createDoctor(req, res, next) {
    try {
      const {
        email,
        password,
        fullName,
        phone,
        dateOfBirth,
        gender,
        specialization,
        licenseNumber,
        experienceYear,
        bio,
        isActive = true,
      } = req.body;

      const file = req.file;

      if (!email || !password || !fullName || !specialization) {
        return res.status(400).json({
          success: false,
          message: "Email, password, fullName, dan specialization wajib diisi",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }

      // Check if phone already exists
      if (phone) {
        const existingPhone = await prisma.user.findUnique({
          where: { phone },
        });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: "Nomor telepon sudah terdaftar",
          });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let imageUrl =
        "https://az4khupscvsqksn6.public.blob.vercel-storage.com/defaultdoctor.png";

      // Upload image if exists
      if (file) {
        const fileName = `doctor-${Date.now()}-${file.originalname}`;
        const { url } = await put(fileName, file.buffer, { access: "public" });
        imageUrl = url;
      }

      // Create doctor with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            phone: phone || null,
            fullName,
            emailVerified: true,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            role: "DOCTOR",
          },
        });

        // Create doctor profile
        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            image: imageUrl,
            specialization,
            licenseNumber: licenseNumber || null,
            experienceYear: experienceYear ? parseInt(experienceYear) : null,
            bio: bio || null,
            isActive: Boolean(isActive),
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                dateOfBirth: true,
                gender: true,
                role: true,
                createdAt: true,
              },
            },
          },
        });

        return doctor;
      });

      return res.status(201).json({
        success: true,
        message: "Dokter berhasil ditambahkan",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get all doctors with pagination and filters
   * GET /api/doctors
   */
  async getAllDoctors(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        specialization,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {
        AND: [
          {
            OR: [
              { user: { fullName: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { specialization: { contains: search, mode: "insensitive" } },
            ],
          },
          specialization ? { specialization } : {},
          isActive !== undefined ? { isActive: isActive === "true" } : {},
        ].filter(Boolean),
      };

      // Get total count
      const total = await prisma.doctor.count({ where });

      // Get doctors
      const doctors = await prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              dateOfBirth: true,
              gender: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              consultations: true,
              chatRooms: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limitNum,
      });

      return res.json({
        success: true,
        data: doctors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get single doctor by ID
   * GET /api/doctors/:id
   */
  async getDoctorById(req, res, next) {
    try {
      const { id } = req.params;

      const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              dateOfBirth: true,
              gender: true,
              role: true,
              createdAt: true,
              userProfile: true,
            },
          },
          consultations: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  userProfile: true,
                },
              },
            },
          },
          chatRooms: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Dokter tidak ditemukan",
        });
      }

      return res.json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE - Update doctor data
   * PATCH /api/doctors/:id
   */
  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const {
        fullName,
        phone,
        dateOfBirth,
        gender,
        specialization,
        licenseNumber,
        experienceYear,
        bio,
        isActive,
        email,
        password,
      } = req.body;

      const file = req.file;

      // Check if doctor exists
      const existingDoctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!existingDoctor) {
        return res.status(404).json({
          success: false,
          message: "Dokter tidak ditemukan",
        });
      }

      // Prepare update data for user
      const userUpdateData = {};
      if (fullName) userUpdateData.fullName = fullName;
      if (phone !== undefined) userUpdateData.phone = phone || null;
      if (dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (gender !== undefined) userUpdateData.gender = gender || null;
      if (email !== undefined) userUpdateData.email = email;

      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        userUpdateData.passwordHash = await bcrypt.hash(password, salt);
      }

      // Upload new image if exists
      let imageUrl;
      if (file) {
        const fileName = `doctor-${id}-${Date.now()}.png`;
        const { url } = await put(fileName, file.buffer, { access: "public" });
        imageUrl = url;
      }

      // Prepare update data for doctor
      const doctorUpdateData = {};
      if (imageUrl) doctorUpdateData.image = imageUrl;
      if (specialization) doctorUpdateData.specialization = specialization;
      if (licenseNumber !== undefined)
        doctorUpdateData.licenseNumber = licenseNumber || null;
      if (experienceYear !== undefined)
        doctorUpdateData.experienceYear = experienceYear
          ? parseInt(experienceYear)
          : null;
      if (bio !== undefined) doctorUpdateData.bio = bio || null;
      if (isActive !== undefined) doctorUpdateData.isActive = Boolean(isActive);

      // Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update user if there's user data to update
        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: existingDoctor.userId },
            data: userUpdateData,
          });
        }

        // Update doctor if there's doctor data to update
        if (Object.keys(doctorUpdateData).length > 0) {
          return await tx.doctor.update({
            where: { id },
            data: doctorUpdateData,
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true,
                  fullName: true,
                  dateOfBirth: true,
                  gender: true,
                  role: true,
                  createdAt: true,
                },
              },
            },
          });
        }

        // If only user data was updated, return existing doctor with updated user
        return await tx.doctor.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                dateOfBirth: true,
                gender: true,
                role: true,
                createdAt: true,
              },
            },
          },
        });
      });

      return res.json({
        success: true,
        message: "Data dokter berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE - Delete doctor
   * DELETE /api/doctors/:id
   */
  async deleteDoctor(req, res, next) {
    try {
      const { id } = req.params;

      // Check if doctor exists
      const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
          user: true,
          consultations: true,
          chatRooms: true,
        },
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Dokter tidak ditemukan",
        });
      }

      // Check if doctor has related records
      const hasConsultations = doctor.consultations.length > 0;
      const hasChatRooms = doctor.chatRooms.length > 0;

      if (hasConsultations || hasChatRooms) {
        // Soft delete: only mark as inactive
        await prisma.doctor.update({
          where: { id },
          data: { isActive: false },
        });

        return res.json({
          success: true,
          message:
            "Dokter dinonaktifkan karena memiliki data terkait (konsultasi/chat)",
          data: { id, isActive: false },
        });
      }

      // Hard delete: no related records found
      await prisma.$transaction(async (tx) => {
        // Delete doctor first
        await tx.doctor.delete({
          where: { id },
        });

        // Then delete user
        await tx.user.delete({
          where: { id: doctor.userId },
        });
      });

      return res.json({
        success: true,
        message: "Dokter berhasil dihapus",
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get doctor statistics
   * GET /api/doctors/:id/stats
   */
  async getDoctorStats(req, res, next) {
    try {
      const { id } = req.params;

      const doctor = await prisma.doctor.findUnique({
        where: { id },
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Dokter tidak ditemukan",
        });
      }

      // Get consultation statistics
      const consultations = await prisma.consultation.groupBy({
        by: ["status"],
        where: { doctorId: id },
        _count: true,
      });

      // Get recent consultations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentConsultations = await prisma.consultation.count({
        where: {
          doctorId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      // Get chat room statistics
      const chatRooms = await prisma.chatRoom.count({
        where: { doctorId: id, isActive: true },
      });

      // Get consultation completion rate
      const totalConsultations = await prisma.consultation.count({
        where: { doctorId: id },
      });

      const completedConsultations = await prisma.consultation.count({
        where: { doctorId: id, status: "COMPLETED" },
      });

      const completionRate =
        totalConsultations > 0
          ? Math.round((completedConsultations / totalConsultations) * 100)
          : 0;

      const stats = {
        consultationStats: consultations.reduce((acc, curr) => {
          acc[curr.status.toLowerCase()] = curr._count;
          return acc;
        }, {}),
        totalConsultations,
        recentConsultations,
        activeChatRooms: chatRooms,
        completionRate: `${completionRate}%`,
        experienceYears: doctor.experienceYear || 0,
      };

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Search doctors by name or specialization
   * GET /api/doctors/search?q=...
   */
  async searchDoctors(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Query pencarian diperlukan",
        });
      }

      const doctors = await prisma.doctor.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { user: { fullName: { contains: q, mode: "insensitive" } } },
                { specialization: { contains: q, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              userProfile: true,
            },
          },
        },
        take: 20,
        orderBy: {
          specialization: "asc",
        },
      });

      return res.json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get available doctors for scheduling
   * GET /api/doctors/available
   */
  async getAvailableDoctors(req, res, next) {
    try {
      const { specialization, date } = req.query;

      const where = {
        isActive: true,
        ...(specialization && { specialization }),
      };

      const doctors = await prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              userProfile: true,
            },
          },
          consultations: {
            where: {
              status: { in: ["PENDING", "ONGOING"] },
              ...(date && {
                scheduledAt: {
                  gte: new Date(date),
                  lt: new Date(
                    new Date(date).setDate(new Date(date).getDate() + 1)
                  ),
                },
              }),
            },
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
            },
          },
        },
        orderBy: {
          specialization: "asc",
        },
      });

      // Add availability status
      const doctorsWithAvailability = doctors.map((doctor) => ({
        ...doctor,
        availability: doctor.consultations.length === 0 ? "AVAILABLE" : "BUSY",
        bookedSlots: doctor.consultations,
      }));

      return res.json({
        success: true,
        data: doctorsWithAvailability,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DoctorController();
