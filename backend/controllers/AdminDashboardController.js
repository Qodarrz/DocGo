const prisma = require("../db/prisma");

class AdminDashboardController {
  getAdminDashboard = async (req, res, next) => {
    try {
      const user = req.user;

      if (user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya untuk admin.",
        });
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      // --- Basic statistics ---
      const totalUsers = await prisma.user.count();
      const usersByRole = await prisma.user.groupBy({
        by: ["role"],
        _count: true,
      });

      const activePatients = await prisma.user.count({
        where: {
          OR: [
            { consultations: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { healthMetrics: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          ],
        },
      });

      const totalDoctors = await prisma.doctor.count({
        where: { isActive: true },
      });

      const totalConsultations = await prisma.consultation.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "CANCELLED" },
        },
      });

      const appointmentsToday = await prisma.consultation.count({
        where: {
          scheduledAt: { gte: todayStart, lt: todayEnd },
          status: { in: ["PENDING", "ONGOING"] },
        },
      });

      const pendingSymptomChecks = await prisma.symptomCheck.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          OR: [
            { triageLevel: "HIGH" },
            { triageLevel: "EMERGENCY" },
            { riskLevel: "HIGH" },
          ],
        },
      });

      const activeMedications = await prisma.medication.count({
        where: {
          isActive: true,
          endDate: { gte: now },
        },
      });

      const totalHealthMetrics = await prisma.healthMetric.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });

      const statistics = [
        {
          title: "Total Users",
          value: totalUsers,
          description: "Registered users",
          icon: "users",
        },
        {
          title: "Active Patients",
          value: activePatients,
          description: "Last 30 days",
          icon: "activity",
        },
        {
          title: "Total Doctors",
          value: totalDoctors,
          description: "Active doctors",
          icon: "user-md",
        },
        {
          title: "Consultations",
          value: totalConsultations,
          description: "Last 30 days",
          icon: "stethoscope",
        },
        {
          title: "Today's Appointments",
          value: appointmentsToday,
          description: "Scheduled for today",
          icon: "calendar",
        },
        {
          title: "High Priority Cases",
          value: pendingSymptomChecks,
          description: "Emergency/HIGH triage",
          icon: "alert-triangle",
        },
        {
          title: "Active Medications",
          value: activeMedications,
          description: "Currently prescribed",
          icon: "pills",
        },
        {
          title: "Health Metrics",
          value: totalHealthMetrics,
          description: "Recorded last 30 days",
          icon: "heart",
        },
      ];

      // --- Serial query execution to avoid PgBouncer max clients ---
      const totalNotifications = await prisma.notification.count();
      const unreadNotifications = await prisma.notification.count({
        where: { isRead: false },
      });
      const totalChats = await prisma.chatRoom.count();
      const activeChats = await prisma.chatRoom.count({
        where: { isActive: true },
      });
      const totalMealPlans = await prisma.mealPlan.count();
      const totalEmergencyContacts = await prisma.emergencyContact.count();
      const totalReminders = await prisma.reminder.count({
        where: { isActive: true },
      });

      const platformStats = {
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
          readRate:
            totalNotifications > 0
              ? (
                  ((totalNotifications - unreadNotifications) /
                    totalNotifications) *
                  100
                ).toFixed(1)
              : 0,
        },
        chats: {
          total: totalChats,
          active: activeChats,
          inactive: totalChats - activeChats,
        },
        nutrition: {
          totalMealPlans,
          avgPlansPerUser: await this.getAvgMealPlansPerUser(),
        },
        emergency: {
          totalContacts: totalEmergencyContacts,
          primaryContacts: await prisma.emergencyContact.count({
            where: { isPrimary: true },
          }),
        },
        reminders: {
          total: totalReminders,
          active: totalReminders,
        },
      };

      // --- Prepare detailed data ---
      const userGrowth = await this.getUserGrowth(now);
      const consultationTrends = await this.getConsultationTrends(now);
      const symptomAnalysis = await this.getSymptomAnalysis();
      const healthMetricsTrend = await this.getHealthMetricsTrend(now);
      const recentUsers = await this.getRecentUsers();
      const recentConsultations = await this.getRecentConsultations();
      const recentSymptomChecks = await this.getRecentSymptomChecks();
      const doctorStats = await this.getDoctorStats();
      const diseaseStats = await this.getDiseaseStats();
      const genderDistribution = await this.getGenderDistribution();

      return res.json({
        success: true,
        data: {
          adminInfo: {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
          },
          statistics,
          overview: {
            userGrowth,
            consultationTrends,
            symptomAnalysis,
            healthMetricsTrend,
          },
          detailedData: {
            recentUsers,
            recentConsultations,
            recentSymptomChecks,
            doctors: doctorStats,
            diseases: diseaseStats,
          },
          platformStats,
          demographics: {
            genderDistribution,
            usersByRole,
            ageDistribution: await this.getAgeDistribution(),
          },
          charts: {
            userGrowthChart: this.formatUserGrowthChart(userGrowth),
            consultationTypeChart: await this.getConsultationTypeChart(),
            doctorPerformanceChart: await this.getDoctorPerformanceChart(),
            symptomTriageChart: await this.getSymptomTriageChart(),
            healthMetricTypeChart: await this.getHealthMetricTypeChart(),
            genderChart: genderDistribution,
          },
          quickStats: await this.getQuickStats(),
          systemHealth: await this.getSystemHealth(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper Methods
  getUserGrowth = async (now) => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users by date (last 30 days)
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date and role
    const grouped = {};
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { total: 0, USER: 0, DOCTOR: 0, ADMIN: 0 };
      }
      grouped[date].total++;
      grouped[date][user.role]++;
    });

    // Convert to array
    return Object.entries(grouped).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  };

  getConsultationTrends = async (now) => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const consultations = await prisma.consultation.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        type: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const grouped = {};
    consultations.forEach((consultation) => {
      const date = consultation.createdAt.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = {
          total: 0,
          GENERAL: 0,
          SPECIALIST: 0,
          PSYCHOLOGY: 0,
          COMPLETED: 0,
          PENDING: 0,
          ONGOING: 0,
          CANCELLED: 0,
        };
      }
      grouped[date].total++;
      grouped[date][consultation.type]++;
      grouped[date][consultation.status]++;
    });

    return Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  };

  getSymptomAnalysis = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const symptoms = await prisma.symptomCheck.groupBy({
      by: ["triageLevel", "riskLevel"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    const likelyConditions = await prisma.symptomCheck.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        likelyConditions: { not: null },
      },
      select: {
        likelyConditions: true,
      },
      take: 100,
    });

    // Extract top conditions
    const conditionMap = {};
    likelyConditions.forEach((item) => {
      if (item.likelyConditions) {
        try {
          const conditions =
            typeof item.likelyConditions === "string"
              ? JSON.parse(item.likelyConditions)
              : item.likelyConditions;

          if (Array.isArray(conditions)) {
            conditions.forEach((cond) => {
              if (cond && cond.name) {
                conditionMap[cond.name] = (conditionMap[cond.name] || 0) + 1;
              }
            });
          }
        } catch (error) {
          console.error("Error parsing likelyConditions:", error);
        }
      }
    });

    const topConditions = Object.entries(conditionMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      triageDistribution: symptoms.filter((s) => s.triageLevel),
      riskDistribution: symptoms.filter((s) => s.riskLevel),
      topConditions,
    };
  };

  getHealthMetricsTrend = async (now) => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await prisma.healthMetric.groupBy({
      by: ["type"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      _avg: {
        value: true,
      },
    });

    const dailyTrend = await prisma.healthMetric.groupBy({
      by: ["recordedAt"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        type: "HEART_RATE",
      },
      _avg: {
        value: true,
      },
      orderBy: {
        recordedAt: "asc",
      },
    });

    return {
      byType: metrics,
      dailyHeartRate: dailyTrend.map((item) => ({
        date: item.recordedAt.toISOString().split("T")[0],
        avgHeartRate: item._avg.value,
      })),
    };
  };

  getRecentUsers = async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        userProfile: true,
        _count: {
          select: {
            consultations: true,
            healthMetrics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  };

  getRecentConsultations = async () => {
    return await prisma.consultation.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  };

  getRecentSymptomChecks = async () => {
    return await prisma.symptomCheck.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        relatedDisease: {
          select: {
            name: true,
          },
        },
      },
      where: {
        OR: [{ triageLevel: "HIGH" }, { triageLevel: "EMERGENCY" }],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  };

  getDoctorStats = async () => {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            consultations: true,
          },
        },
      },
      where: { isActive: true },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.fullName,
      specialization: doctor.specialization,
      experience: doctor.experienceYear,
      totalConsultations: doctor._count.consultations,
      rating: 4.5, // Default rating, bisa diupdate dengan data sebenarnya
      isActive: doctor.isActive,
    }));
  };

  getDiseaseStats = async () => {
    const diseases = await prisma.disease.findMany({
      include: {
        _count: {
          select: {
            userDiseases: true,
            symptomChecks: true,
          },
        },
      },
      orderBy: {
        userDiseases: {
          _count: "desc",
        },
      },
      take: 10,
    });

    return diseases.map((disease) => ({
      id: disease.id,
      name: disease.name,
      isChronic: disease.isChronic,
      totalPatients: disease._count.userDiseases,
      totalSymptoms: disease._count.symptomChecks,
      description: disease.description,
    }));
  };

  getPlatformStats = async () => {
    const [
      totalNotifications,
      unreadNotifications,
      totalChats,
      activeChats,
      totalMealPlans,
      totalEmergencyContacts,
      totalReminders,
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.chatRoom.count(),
      prisma.chatRoom.count({ where: { isActive: true } }),
      prisma.mealPlan.count(),
      prisma.emergencyContact.count(),
      prisma.reminder.count({ where: { isActive: true } }),
    ]);

    return {
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        readRate:
          totalNotifications > 0
            ? (
                ((totalNotifications - unreadNotifications) /
                  totalNotifications) *
                100
              ).toFixed(1)
            : 0,
      },
      chats: {
        total: totalChats,
        active: activeChats,
        inactive: totalChats - activeChats,
      },
      nutrition: {
        totalMealPlans,
        avgPlansPerUser: await this.getAvgMealPlansPerUser(),
      },
      emergency: {
        totalContacts: totalEmergencyContacts,
        primaryContacts: await prisma.emergencyContact.count({
          where: { isPrimary: true },
        }),
      },
      reminders: {
        total: totalReminders,
        active: totalReminders, // Semua reminders aktif
      },
    };
  };

  getGenderDistribution = async () => {
    const users = await prisma.user.groupBy({
      by: ["gender"],
      _count: true,
      where: {
        gender: { not: null },
      },
    });

    return users.map((item) => ({
      gender: item.gender,
      count: item._count,
    }));
  };

  getAgeDistribution = async () => {
    const users = await prisma.user.findMany({
      select: {
        dateOfBirth: true,
      },
      where: {
        dateOfBirth: { not: null },
      },
    });

    const now = new Date();
    const ageGroups = [
      { range: "0-17", min: 0, max: 17, count: 0 },
      { range: "18-25", min: 18, max: 25, count: 0 },
      { range: "26-35", min: 26, max: 35, count: 0 },
      { range: "36-45", min: 36, max: 45, count: 0 },
      { range: "46-55", min: 46, max: 55, count: 0 },
      { range: "56-65", min: 56, max: 65, count: 0 },
      { range: "65+", min: 66, max: 150, count: 0 },
    ];

    users.forEach((user) => {
      if (user.dateOfBirth) {
        const birthDate = new Date(user.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();

        const group = ageGroups.find((g) => age >= g.min && age <= g.max);
        if (group) {
          group.count++;
        }
      }
    });

    return ageGroups;
  };

  getAvgMealPlansPerUser = async () => {
    const result = await prisma.mealPlan.groupBy({
      by: ["userId"],
      _count: true,
    });
    if (result.length === 0) return 0;
    const total = result.reduce((sum, item) => sum + item._count, 0);
    return (total / result.length).toFixed(2);
  };

  // Chart Data Methods
  formatUserGrowthChart = (userGrowth) =>
    userGrowth.map((item) => ({
      date: item.date,
      users: item.total,
      patients: item.USER,
      doctors: item.DOCTOR,
      admins: item.ADMIN,
    }));

  getConsultationTypeChart = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await prisma.consultation.groupBy({
      by: ["type"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: "CANCELLED" },
      },
      _count: true,
    });

    return data.map((item) => ({
      type: item.type,
      count: item._count,
    }));
  };

  getDoctorPerformanceChart = async () => {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            consultations: {
              where: {
                status: "COMPLETED",
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
      },
      where: { isActive: true },
    });

    return doctors
      .map((doctor) => ({
        name: doctor.user.fullName || "Unknown",
        consultations: doctor._count.consultations,
        specialization: doctor.specialization,
        rating: 4.5, // Default rating
      }))
      .sort((a, b) => b.consultations - a.consultations)
      .slice(0, 10);
  };

  getSymptomTriageChart = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await prisma.symptomCheck.groupBy({
      by: ["triageLevel"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    return data.map((item) => ({
      level: item.triageLevel,
      count: item._count,
    }));
  };

  getHealthMetricTypeChart = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await prisma.healthMetric.groupBy({
      by: ["type"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      _avg: {
        value: true,
      },
    });

    return data.map((item) => ({
      type: item.type,
      count: item._count,
      averageValue: item._avg.value ? item._avg.value.toFixed(2) : null,
    }));
  };

  getQuickStats = async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      newUsers24h,
      newConsultations24h,
      newSymptoms24h,
      newMetrics24h,
      completedConsultations24h,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.consultation.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.symptomCheck.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.healthMetric.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.consultation.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      last24Hours: {
        newUsers: newUsers24h,
        newConsultations: newConsultations24h,
        newSymptoms: newSymptoms24h,
        newMetrics: newMetrics24h,
        completedConsultations: completedConsultations24h,
      },
    };
  };

  getSystemHealth = async () => {
    // Cek ketersediaan data dan performance
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [recentConsultations, recentMessages, recentMetrics, databaseStatus] =
      await Promise.all([
        prisma.consultation.count({ where: { createdAt: { gte: hourAgo } } }),
        prisma.message.count({ where: { createdAt: { gte: hourAgo } } }),
        prisma.healthMetric.count({ where: { createdAt: { gte: hourAgo } } }),
        this.checkDatabaseStatus(),
      ]);

    return {
      activityLastHour: {
        consultations: recentConsultations,
        messages: recentMessages,
        healthMetrics: recentMetrics,
      },
      database: databaseStatus,
      apiResponseTime: "fast", // fast, medium, slow
      systemLoad: "normal", // normal, high, critical
    };
  };

  checkDatabaseStatus = async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "connected", timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  };
}

module.exports = new AdminDashboardController();
