const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendNotification } = require("../helper/notif");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const pendingConsultations = await prisma.consultation.findMany({
      where: { status: "PENDING" },
    });

    for (const consult of pendingConsultations) {
      const start = new Date(consult.scheduledAt);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + consult.duration);

      if (now >= end) {
        await prisma.consultation.update({
          where: { id: consult.id },
          data: { status: "CANCELLED" },
        });
        continue;
      }

      // Jika belum lewat, cek apakah sudah waktunya mulai
      if (now >= start) {
        // Cek apakah chatRoom sudah ada di DB
        const existingChatRoom = await prisma.chatRoom.findUnique({
          where: { consultationId: consult.id },
        });

        if (!existingChatRoom) {
          await prisma.chatRoom.create({
            data: {
              consultationId: consult.id,
              userId: consult.userId,
              doctorId: consult.doctorId,
            },
          });

          await prisma.consultation.update({
            where: { id: consult.id },
            data: { status: "ONGOING" },
          });

          // Kirim notifikasi
          sendNotification({
            userId: consult.userId,
            title: "Konsultasi dimulai",
            message: "Chat room Anda sudah aktif, konsultasi dimulai!",
          });

          sendNotification({
            userId: consult.doctorId,
            title: "Konsultasi dimulai",
            message: "Chat room pasien sudah aktif, silahkan mulai konsultasi.",
          });
        }
      }
    }

    // 2. Tangani ONGOING yang sudah lewat end → COMPLETED
    const ongoingConsultations = await prisma.consultation.findMany({
      where: { status: "ONGOING" },
    });

    for (const consult of ongoingConsultations) {
      const start = new Date(consult.scheduledAt);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + consult.duration);

      if (now >= end) {
        await prisma.consultation.update({
          where: { id: consult.id },
          data: { status: "COMPLETED" },
        });

        await prisma.chatRoom.updateMany({
          where: { consultationId: consult.id },
          data: { isActive: false },
        });
      }
    }
  } catch (error) {
    console.error("Worker error:", error);
  }
});

console.log("Reminder Worker running...");
