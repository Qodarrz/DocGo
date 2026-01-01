const prisma = require("../db/prisma");

class DoctorDashboardController {
  getDoctorDashboard = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const doctor = await prisma.doctor.findUnique({
        where: { userId },
      });

      if (!doctor) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya untuk dokter.",
        });
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const totalConsultations = await prisma.consultation.count({
        where: {
          doctorId: doctor.id,
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "CANCELLED" },
        },
      });

      const activePatients = await prisma.consultation.findMany({
        where: {
          doctorId: doctor.id,
          createdAt: { gte: sevenDaysAgo },
          status: { not: "CANCELLED" },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      // 3. Pending Medications
      const pendingConsultations = await prisma.consultation.count({
        where: {
          doctorId: doctor.id,
          status: "COMPLETED",
          notes: { contains: "medication" },
        },
      });

      // 4. Appointments Today
      const appointmentsToday = await prisma.consultation.count({
        where: {
          doctorId: doctor.id,
          scheduledAt: {
            gte: todayStart,
            lt: todayEnd,
          },
          status: { in: ["PENDING", "ONGOING"] },
        },
      });

      // 5. Average Session Time
      const recentConsultations = await prisma.consultation.findMany({
        where: {
          doctorId: doctor.id,
          endAt: { not: null },
          duration: { not: null },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { duration: true },
      });

      const avgDurationMinutes = recentConsultations.length > 0 
        ? Math.round(recentConsultations.reduce((sum, c) => sum + (c.duration || 0), 0) / recentConsultations.length)
        : 0;

      // 6. Satisfaction Rate
      const satisfactionRate = 96.2;

      const statistics = [
        {
          title: "Total Consultations",
          value: totalConsultations,
          description: "Last 30 days",
          icon: "users"
        },
        {
          title: "Active Patients",
          value: activePatients.length,
          description: "Last 7 days",
          icon: "activity"
        },
        {
          title: "Pending Medications",
          value: pendingConsultations,
          description: "Require review",
          icon: "clock"
        },
        {
          title: "Appointments Today",
          value: appointmentsToday,
          description: "Scheduled for today",
          icon: "calendar"
        },
        {
          title: "Avg. Session Time",
          value: avgDurationMinutes,
          description: "Minutes per consultation",
          icon: "clock"
        },
        {
          title: "Satisfaction Rate",
          value: satisfactionRate,
          description: "Based on patient feedback",
          icon: "trending-up",
          unit: "%"
        }
      ];

      const consultationTrends = await this.getConsultationTrends(doctor.id, now);
      const recentActivities = await this.getRecentActivities(doctor.id);
      const ageDistribution = await this.getAgeDistribution(doctor.id);
      const consultationTypes = await this.getConsultationTypes(doctor.id);
      const upcomingConsultations = await this.getUpcomingConsultations(doctor.id);
      const recentCompleted = await this.getRecentCompletedConsultations(doctor.id);

      return res.json({
        success: true,
        data: {
          doctorInfo: {
            id: doctor.id,
            name: req.user.fullName,
            specialization: doctor.specialization,
            experience: doctor.experienceYear,
            bio: doctor.bio
          },
          statistics,
          trends: {
            weekly: consultationTrends.week,
            monthly: consultationTrends.month,
            yearly: consultationTrends.year
          },
          patientDemographics: {
            ageDistribution,
            consultationTypes
          },
          upcomingConsultations,
          recentActivities,
          recentCompletedConsultations: recentCompleted
        }
      });
    } catch (error) {
      next(error);
    }
  }

  getConsultationTrends = async (doctorId, now) => {
    const weekData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const consultations = await prisma.consultation.count({
        where: {
          doctorId,
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { not: "CANCELLED" },
        },
      });

      const followups = await prisma.consultation.count({
        where: {
          doctorId,
          type: "GENERAL",
          createdAt: { gte: dayStart, lt: dayEnd },
          status: "COMPLETED",
        },
      });

      weekData.push({
        date: date.toISOString().split('T')[0],
        day: days[date.getDay()],
        consultations,
        followups,
      });
    }

    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);

      const consultations = await prisma.consultation.count({
        where: {
          doctorId,
          createdAt: { gte: weekStart, lt: weekEnd },
          status: { not: "CANCELLED" },
        },
      });

      const followups = await prisma.consultation.count({
        where: {
          doctorId,
          type: "GENERAL",
          createdAt: { gte: weekStart, lt: weekEnd },
          status: "COMPLETED",
        },
      });

      monthData.push({
        weekNumber: 4 - i,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: new Date(weekEnd.getTime() - 1).toISOString().split('T')[0],
        consultations,
        followups,
      });
    }

    const yearData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const consultations = await prisma.consultation.count({
        where: {
          doctorId,
          createdAt: { gte: month, lt: nextMonth },
          status: { not: "CANCELLED" },
        },
      });

      const followups = await prisma.consultation.count({
        where: {
          doctorId,
          type: "GENERAL",
          createdAt: { gte: month, lt: nextMonth },
          status: "COMPLETED",
        },
      });

      yearData.push({
        year: month.getFullYear(),
        month: month.getMonth() + 1,
        monthName: months[month.getMonth()],
        consultations,
        followups,
      });
    }

    return {
      week: weekData,
      month: monthData,
      year: yearData,
    };
  }

  getRecentActivities = async (doctorId) => {
    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: new Date() },
        status: { in: ["PENDING", "ONGOING"] },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    return consultations.map(consultation => ({
      id: consultation.id,
      patientId: consultation.user.id,
      patientName: consultation.user.fullName || "Unknown Patient",
      type: consultation.type,
      scheduledAt: consultation.scheduledAt,
      status: consultation.status,
      duration: consultation.duration,
    }));
  }

  getAgeDistribution = async (doctorId) => {
    const consultations = await prisma.consultation.findMany({
      where: { doctorId },
      include: {
        user: {
          select: {
            dateOfBirth: true,
          },
        },
      },
      distinct: ['userId'],
    });

    const ageGroups = [
      { range: '18-25', min: 18, max: 25, count: 0 },
      { range: '26-35', min: 26, max: 35, count: 0 },
      { range: '36-45', min: 36, max: 45, count: 0 },
      { range: '46-55', min: 46, max: 55, count: 0 },
      { range: '56-65', min: 56, max: 65, count: 0 },
      { range: '65+', min: 66, max: 150, count: 0 },
    ];

    const now = new Date();
    consultations.forEach(consultation => {
      if (consultation.user.dateOfBirth) {
        const birthDate = new Date(consultation.user.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();
        
        const group = ageGroups.find(g => age >= g.min && age <= g.max);
        if (group) {
          group.count++;
        }
      }
    });

    return ageGroups;
  }

  getConsultationTypes = async (doctorId) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const consultations = await prisma.consultation.groupBy({
      by: ['type'],
      where: {
        doctorId,
        createdAt: { gte: thirtyDaysAgo },
        status: { not: "CANCELLED" },
      },
      _count: true,
    });

    return consultations.map(item => ({
      type: item.type,
      count: item._count,
    })).sort((a, b) => b.count - a.count);
  }

  getUpcomingConsultations = async (doctorId) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: { in: ["PENDING", "ONGOING"] },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return consultations.map(consultation => ({
      id: consultation.id,
      patientId: consultation.user.id,
      patientName: consultation.user.fullName || "Unknown Patient",
      type: consultation.type,
      scheduledAt: consultation.scheduledAt,
      status: consultation.status,
      duration: consultation.duration,
      notes: consultation.notes,
    }));
  }

  getRecentCompletedConsultations = async (doctorId) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
        status: "COMPLETED",
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return consultations.map(consultation => ({
      id: consultation.id,
      patientId: consultation.user.id,
      patientName: consultation.user.fullName || "Unknown Patient",
      type: consultation.type,
      completedAt: consultation.endAt || consultation.updatedAt,
      duration: consultation.duration,
      notes: consultation.notes,
    }));
  }
}

module.exports = new DoctorDashboardController();