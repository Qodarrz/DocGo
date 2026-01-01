const prisma = require("../db/prisma");

const createConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, type, scheduledAt, duration } = req.body;

    const scheduledDate = new Date(scheduledAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    scheduledDate.setHours(0, 0, 0, 0);

    if (scheduledDate < yesterday || scheduledDate > today) {
      return res
        .status(400)
        .json({ message: "Booking hanya bisa untuk hari ini atau kemarin" });
    }

    // Hitung waktu selesai
    const endAt = new Date(new Date(scheduledAt).getTime() + duration * 60000);

    const overlap = await prisma.consultation.findFirst({
      where: {
        doctorId,
        status: { in: ["PENDING", "ONGOING"] },
        AND: [
          {
            scheduledAt: { lte: endAt },
          },
          {
            endAt: { gte: new Date(scheduledAt) },
          },
        ],
      },
    });

    if (overlap) {
      return res
        .status(400)
        .json({ message: "Dokter sudah ada sesi lain di waktu ini." });
    }

    // Buat consultation dengan endAt
    const consultation = await prisma.consultation.create({
      data: {
        userId,
        doctorId,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        endAt, // simpan endAt
        status: "PENDING",
      },
    });

    // Buat chatRoom otomatis
    const chatRoom = await prisma.chatRoom.create({
      data: {
        consultationId: consultation.id,
        userId,
        doctorId,
        isActive: true,
      },
    });

    return res.status(201).json({ consultation, chatRoom });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi error saat membuat consultation." });
  }
};

const getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    // Awal hari ini
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Akhir besok
    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const consultations = await prisma.consultation.findMany({
      where: {
        userId,
        scheduledAt: {
          gte: startOfToday,
          lte: endOfTomorrow,
        },
      },
      include: {
        doctor: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                userProfile: true,
              },
            },
          },
        },
        chatRoom: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return res.json(consultations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching consultations",
    });
  }
};

const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId wajib diberikan" });
    }

    const now = new Date();

    // Hari ini UTC: mulai dari 00:00:00 sampai 23:59:59
    const todayStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const todayEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    // Besok UTC: 00:00:00 sampai 23:59:59
    const tomorrowStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const tomorrowEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      23, 59, 59, 999
    ));

    // Ambil semua consultation PENDING / ONGOING untuk dokter ini
    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
        status: { in: ["PENDING", "ONGOING"] },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Inisialisasi response
    const bookedSlots = { today: [], tomorrow: [] };

    consultations.forEach(c => {
      const start = new Date(c.scheduledAt);
      const end = new Date(start.getTime() + c.duration * 60000); // hitung end dari duration
      const slot = { id: c.id, start, end, status: c.status };

      if (start >= todayStart && start <= todayEnd) {
        bookedSlots.today.push(slot);
      } else if (start >= tomorrowStart && start <= tomorrowEnd) {
        bookedSlots.tomorrow.push(slot);
      }
    });

    return res.json({ doctorId, bookedSlots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil jadwal dokter" });
  }
};


const getDoctorConsultations = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Anda bukan dokter." });
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            userProfile: true,
          },
        },
        chatRoom: true,
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    return res.json(consultations);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching doctor consultations" });
  }
};

const getPatientSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        doctor: true,
        user: {
          include: {
            medicalProfile: true,
            userDiseases: {
              where: { status: "ACTIVE" },
              include: { disease: true },
            },
          },
        },
      },
    });

    if (!consultation) {
      return res.status(404).json({ message: "Consultation tidak ditemukan" });
    }

    if (consultation.doctor.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (!["ONGOING", "COMPLETED"].includes(consultation.status)) {
      return res.status(403).json({ message: "Consultation belum aktif" });
    }

    const latestSymptom = await prisma.symptomCheck.findFirst({
      where: { userId: consultation.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      patient: {
        id: consultation.user.id,
        name: consultation.user.fullName,
        gender: consultation.user.gender,
        dateOfBirth: consultation.user.dateOfBirth,
        photo: consultation.user.userProfile,
      },
      medicalProfile: consultation.user.medicalProfile,
      activeDiseases: consultation.user.userDiseases.map((d) => d.disease.name),
      symptomCheck: latestSymptom,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil data pasien" });
  }
};

const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["PENDING", "ONGOING", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        doctor: true,
        chatRoom: true,
      },
    });

    if (!consultation) {
      return res.status(404).json({ message: "Consultation tidak ditemukan" });
    }
    if (consultation.doctor.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Validasi transisi status
    const currentStatus = consultation.status;

    const validTransition =
      (currentStatus === "PENDING" && status === "ONGOING") ||
      (currentStatus === "ONGOING" && status === "COMPLETED");

    if (!validTransition) {
      return res.status(400).json({
        message: `Perubahan status dari ${currentStatus} ke ${status} tidak diperbolehkan`,
      });
    }

    // Update status consultation
    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        status,
      },
    });

    // Jika selesai, nonaktifkan chat room
    if (status === "COMPLETED" && consultation.chatRoom) {
      await prisma.chatRoom.update({
        where: { id: consultation.chatRoom.id },
        data: { isActive: false },
      });
    }

    return res.json({
      message: "Status consultation berhasil diperbarui",
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal memperbarui status consultation",
    });
  }
};

const getDoctorsList = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true, // hanya dokter aktif
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            userProfile: true,
            gender: true,
            dateOfBirth: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(doctors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil daftar dokter" });
  }
};

module.exports = {
  createConsultation,
  getUserConsultations,
  getDoctorConsultations,
  getPatientSummary,
  updateConsultationStatus,
  getDoctorSchedule,
  getDoctorsList,
};
