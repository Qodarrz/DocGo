const prisma = require("../db/prisma");
const bcrypt = require("bcryptjs");

class AdminUserController {
  /**
   * READ - Get all users with pagination and filters
   * GET /api/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        role,
        gender,
        emailVerified,
        sortBy = "createdAt",
        sortOrder = "desc",
        startDate,
        endDate,
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {
        AND: [
          {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
          role ? { role } : {},
          gender ? { gender } : {},
          emailVerified !== undefined
            ? { emailVerified: emailVerified === "true" }
            : {},
          startDate || endDate
            ? {
                createdAt: {
                  ...(startDate && { gte: new Date(startDate) }),
                  ...(endDate && { lte: new Date(endDate) }),
                },
              }
            : {},
        ].filter(Boolean),
      };

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users with their relationships count
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          userProfile: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              userDiseases: true,
              healthMetrics: true,
              medications: true,
              consultations: true,
              symptomChecks: true,
              emergencyContacts: true,
              deviceTokens: true,
              reminders: true,
            },
          },
          doctor: {
            select: {
              id: true,
              specialization: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limitNum,
      });

      // Format response data
      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        age: user.dateOfBirth
          ? Math.floor(
              (new Date() - new Date(user.dateOfBirth)) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : null,
        gender: user.gender,
        role: user.role,
        userProfile: user.userProfile,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isDoctor: !!user.doctor,
        doctorInfo: user.doctor,
        stats: {
          medicalProfile: user._count.medicalProfile > 0,
          diseases: user._count.userDiseases,
          healthMetrics: user._count.healthMetrics,
          medications: user._count.medications,
          consultations: user._count.consultations,
          symptomChecks: user._count.symptomChecks,
          emergencyContacts: user._count.emergencyContacts,
          deviceTokens: user._count.deviceTokens,
          reminders: user._count.reminders,
        },
      }));

      return res.json({
        success: true,
        data: formattedUsers,
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
   * READ - Get user by ID with detailed information
   * GET /api/admin/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          medicalProfile: true,
          userDiseases: true,
          healthMetrics: { take: 10, orderBy: { recordedAt: "desc" } },
          medications: { where: { isActive: true }, take: 10 },
          consultations: { take: 10, orderBy: { createdAt: "desc" } },
          symptomChecks: { take: 10 },
          emergencyContacts: true,
          deviceTokens: true,
          reminders: { where: { isActive: true }, take: 10 },
          notifications: { take: 20 },
          doctor: true,
          _count: {
            select: {
              userDiseases: true,
              healthMetrics: true,
              medications: true,
              consultations: true,
              symptomChecks: true,
              emergencyContacts: true,
              deviceTokens: true,
              reminders: true,
              notifications: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Calculate age
      const age = user.dateOfBirth
        ? Math.floor(
            (new Date() - new Date(user.dateOfBirth)) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null;

      // Format response
      const formattedUser = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        age,
        gender: user.gender,
        role: user.role,
        userProfile: user.userProfile,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        medicalProfile: user.medicalProfile,
        diseases: user.userDiseases,
        recentHealthMetrics: user.healthMetrics,
        activeMedications: user.medications,
        recentConsultations: user.consultations,
        recentSymptomChecks: user.symptomChecks,
        emergencyContacts: user.emergencyContacts,
        deviceTokens: user.deviceTokens,
        activeReminders: user.reminders,
        recentNotifications: user.notifications,
        doctorProfile: user.doctor,

        // ✅ INI KUNCI
        stats: {
          medicalProfile: !!user.medicalProfile,
          diseases: user._count.userDiseases,
          healthMetrics: user._count.healthMetrics,
          medications: user._count.medications,
          consultations: user._count.consultations,
          symptomChecks: user._count.symptomChecks,
          emergencyContacts: user._count.emergencyContacts,
          deviceTokens: user._count.deviceTokens,
          reminders: user._count.reminders,
          notifications: user._count.notifications,
        },
      };

      return res.json({
        success: true,
        data: formattedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * CREATE - Create new user (admin only)
   * POST /api/admin/users
   */
  async createUser(req, res, next) {
    try {
      const {
        email,
        password,
        fullName,
        phone,
        dateOfBirth,
        gender,
        role = "USER",
        emailVerified = false,
      } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: "Email, password, dan fullName wajib diisi",
        });
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
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

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          phone: phone || null,
          fullName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          role,
          emailVerified: Boolean(emailVerified),
        },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          userProfile: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "User berhasil dibuat",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE - Update user data
   * PATCH /api/admin/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const {
        email,
        password,
        fullName,
        phone,
        dateOfBirth,
        gender,
        role,
        emailVerified,
        userProfile,
      } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Check if new email already exists
      if (email && email !== existingUser.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: "Email sudah digunakan oleh user lain",
          });
        }
      }

      // Check if new phone already exists
      if (phone && phone !== existingUser.phone) {
        const existingPhone = await prisma.user.findUnique({
          where: { phone },
        });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: "Nomor telepon sudah digunakan oleh user lain",
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (fullName !== undefined) updateData.fullName = fullName;
      if (phone !== undefined) updateData.phone = phone || null;
      if (dateOfBirth !== undefined)
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (gender !== undefined) updateData.gender = gender || null;
      if (role !== undefined) updateData.role = role;
      if (emailVerified !== undefined)
        updateData.emailVerified = Boolean(emailVerified);
      if (userProfile !== undefined) updateData.userProfile = userProfile;

      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.passwordHash = await bcrypt.hash(password, salt);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          userProfile: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json({
        success: true,
        message: "User berhasil diperbarui",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE - Delete user
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          medicalProfile: true,
          userDiseases: true,
          healthMetrics: true,
          medications: true,
          consultations: true,
          symptomChecks: true,
          emergencyContacts: true,
          deviceTokens: true,
          reminders: true,
          notifications: true,
          doctor: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Check if user has related records
      const hasMedicalProfile = !!user.medicalProfile;
      const hasUserDiseases = user.userDiseases.length > 0;
      const hasHealthMetrics = user.healthMetrics.length > 0;
      const hasMedications = user.medications.length > 0;
      const hasConsultations = user.consultations.length > 0;
      const hasSymptomChecks = user.symptomChecks.length > 0;
      const hasEmergencyContacts = user.emergencyContacts.length > 0;
      const hasDeviceTokens = user.deviceTokens.length > 0;
      const hasReminders = user.reminders.length > 0;
      const hasNotifications = user.notifications.length > 0;
      const hasDoctorProfile = !!user.doctor;

      if (
        hasMedicalProfile ||
        hasUserDiseases ||
        hasHealthMetrics ||
        hasMedications ||
        hasConsultations ||
        hasSymptomChecks ||
        hasEmergencyContacts ||
        hasDeviceTokens ||
        hasReminders ||
        hasNotifications ||
        hasDoctorProfile
      ) {
        // Mark as soft delete (set email to deleted-{timestamp}@deleted.com)
        const deletedEmail = `deleted-${Date.now()}@deleted.com`;
        const deletedPhone = user.phone
          ? `deleted-${Date.now()}-${user.phone}`
          : null;

        await prisma.user.update({
          where: { id },
          data: {
            email: deletedEmail,
            phone: deletedPhone,
            fullName: "Deleted User",
            passwordHash: null,
            otpHash: null,
            resetTokenHash: null,
          },
        });

        return res.json({
          success: true,
          message:
            "User dinonaktifkan (soft delete) karena memiliki data terkait",
          data: {
            id,
            email: deletedEmail,
            softDeleted: true,
          },
        });
      }

      // Hard delete if no related records
      await prisma.user.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: "User berhasil dihapus",
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get user statistics
   * GET /api/admin/users/stats
   */
  async getUserStats(req, res, next) {
    try {
      const [
        totalUsers,
        totalDoctors,
        verifiedUsers,
        todayNewUsers,
        activeToday,
        usersByGender,
        usersByRole,
        usersByMonth,
      ] = await Promise.all([
        // Total users
        prisma.user.count(),

        // Total doctors
        prisma.doctor.count({
          where: { isActive: true },
        }),

        // Verified users
        prisma.user.count({
          where: { emailVerified: true },
        }),

        // Today's new users
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),

        // Users active today (have any activity)
        prisma.user.count({
          where: {
            OR: [
              {
                consultations: {
                  some: {
                    createdAt: {
                      gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                  },
                },
              },
              {
                symptomChecks: {
                  some: {
                    createdAt: {
                      gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                  },
                },
              },
              {
                healthMetrics: {
                  some: {
                    recordedAt: {
                      gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                  },
                },
              },
            ],
          },
        }),

        // Users by gender
        prisma.user.groupBy({
          by: ["gender"],
          _count: true,
          where: {
            gender: { not: null },
          },
        }),

        // Users by role
        prisma.user.groupBy({
          by: ["role"],
          _count: true,
        }),

        // New users by month (last 6 months)
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as count
          FROM "User"
          WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
        `,
      ]);

      const stats = {
        overview: {
          totalUsers,
          totalDoctors,
          verifiedUsers,
          verificationRate:
            totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
          todayNewUsers,
          activeToday,
          activeRate:
            totalUsers > 0 ? Math.round((activeToday / totalUsers) * 100) : 0,
        },
        distribution: {
          byGender: usersByGender.reduce((acc, curr) => {
            acc[curr.gender] = curr._count;
            return acc;
          }, {}),
          byRole: usersByRole.reduce((acc, curr) => {
            acc[curr.role.toLowerCase()] = curr._count;
            return acc;
          }, {}),
        },
        growth: usersByMonth.map((row) => ({
          month: row.month.toISOString().slice(0, 7),
          count: Number(row.count),
        })),
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
   * READ - Search users for autocomplete
   * GET /api/admin/users/search?q=...
   */
  async searchUsers(req, res, next) {
    try {
      const { q, role } = req.query;

      if (!q || q.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Query pencarian diperlukan",
        });
      }

      const where = {
        AND: [
          {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          },
          role ? { role } : {},
        ],
      };

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          userProfile: true,
          role: true,
          createdAt: true,
          doctor: {
            select: {
              specialization: true,
              isActive: true,
            },
          },
        },
        take: 20,
        orderBy: {
          fullName: "asc",
        },
      });

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE - Toggle user verification status
   * PATCH /api/admin/users/:id/toggle-verification
   */
  async toggleVerification(req, res, next) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, emailVerified: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          emailVerified: !user.emailVerified,
        },
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      });

      return res.json({
        success: true,
        message: `Status verifikasi berhasil diubah menjadi ${
          updatedUser.emailVerified ? "Terverifikasi" : "Belum terverifikasi"
        }`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * READ - Get user activity log
   * GET /api/admin/users/:id/activity
   */
  async getUserActivity(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Get various activities
      const [
        consultations,
        symptomChecks,
        healthMetrics,
        medications,
        reminders,
        notifications,
      ] = await Promise.all([
        // Consultations
        prisma.consultation.findMany({
          where: { userId: id },
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            doctor: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),

        // Symptom checks
        prisma.symptomCheck.findMany({
          where: { userId: id },
          select: {
            id: true,
            complaint: true,
            severityHint: true,
            triageLevel: true,
            createdAt: true,
          },
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),

        // Health metrics
        prisma.healthMetric.findMany({
          where: { userId: id },
          select: {
            id: true,
            type: true,
            value: true,
            unit: true,
            recordedAt: true,
          },
          take: parseInt(limit),
          orderBy: { recordedAt: "desc" },
        }),

        // Medications (logs)
        prisma.medicationLog.findMany({
          where: {
            medication: { userId: id },
          },
          select: {
            id: true,
            takenAt: true,
            status: true,
            medication: {
              select: {
                name: true,
              },
            },
          },
          take: parseInt(limit),
          orderBy: { takenAt: "desc" },
        }),

        // Reminders
        prisma.reminder.findMany({
          where: { userId: id },
          select: {
            id: true,
            title: true,
            type: true,
            startAt: true,
            isActive: true,
          },
          take: parseInt(limit),
          orderBy: { startAt: "desc" },
        }),

        // Notifications
        prisma.notification.findMany({
          where: { userId: id },
          select: {
            id: true,
            title: true,
            type: true,
            isRead: true,
            createdAt: true,
          },
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),
      ]);

      // Format activities with type
      const activities = [
        ...consultations.map((c) => ({
          ...c,
          activityType: "CONSULTATION",
          description: `${c.type} consultation with Dr. ${
            c.doctor?.user?.fullName || "Unknown"
          }`,
        })),
        ...symptomChecks.map((s) => ({
          ...s,
          activityType: "SYMPTOM_CHECK",
          description: `Symptom check: ${s.complaint}`,
        })),
        ...healthMetrics.map((h) => ({
          ...h,
          activityType: "HEALTH_METRIC",
          description: `${h.type}: ${h.value} ${h.unit}`,
        })),
        ...medications.map((m) => ({
          ...m,
          activityType: "MEDICATION",
          description: `Medication: ${m.medication.name} - ${m.status}`,
        })),
        ...reminders.map((r) => ({
          ...r,
          activityType: "REMINDER",
          description: `Reminder: ${r.title}`,
        })),
        ...notifications.map((n) => ({
          ...n,
          activityType: "NOTIFICATION",
          description: `Notification: ${n.title}`,
        })),
      ];

      // Sort by date (most recent first)
      activities.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.recordedAt || a.takenAt || a.startAt
        );
        const dateB = new Date(
          b.createdAt || b.recordedAt || b.takenAt || b.startAt
        );
        return dateB - dateA;
      });

      // Limit the final results
      const limitedActivities = activities.slice(0, parseInt(limit));

      return res.json({
        success: true,
        data: limitedActivities,
        summary: {
          consultations: consultations.length,
          symptomChecks: symptomChecks.length,
          healthMetrics: healthMetrics.length,
          medications: medications.length,
          reminders: reminders.length,
          notifications: notifications.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
