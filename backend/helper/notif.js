const prisma = require("../db/prisma");
const { Queue } = require("bullmq");

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

const queue = new Queue("push-notification", { connection });

const NOTIFICATION_TEMPLATES = {
  EMAIL_VERIFIED: {
    type: "SYSTEM",
    title: "Email Berhasil Diverifikasi",
    message: "Email Anda telah berhasil diverifikasi.",
  },
  PASSWORD_RESET_SUCCESS: {
    type: "SYSTEM",
    title: "Password Berhasil Diubah",
    message: "Password Anda telah berhasil diubah.",
  },
  GEJALA_DIANALISA: {
    type: "HEALTH_ALERT",
    title: "Analisa Gejala",
    message: "Analisa gejala berhasil dianalisis.",
  },
  CHAT_MESSAGE: {
    type: "SYSTEM",
    title: "Pesan Baru",
    message: "Anda menerima pesan baru.",
  },
  CONSULTATION_STATUS: {
    type: "CONSULTATION",
    title: "Update Konsultasi",
    message: "Status konsultasi Anda diperbarui.",
  },
  MEDICAL_UPDATE: {
    type: "SYSTEM",
    title: "Update Berhasil",
    message: "Status Kesehatan Anda Diperbarui.",
  },
};

/**
 * Buat notifikasi baru untuk user
 * scheduledAt otomatis sekarang kalau null
 * Langsung enqueue worker kalau waktunya sudah lewat
 */
async function notifyUser({ userId, event, meta = {}, scheduledAt = null, override = {} }) {
  const template = event ? NOTIFICATION_TEMPLATES[event] : null;
  const title = override.title || (template && template.title);
  const message = override.message || (template && template.message);

  const now = new Date();
  if (!scheduledAt) scheduledAt = now;

  const notif = await prisma.notification.create({
    data: {
      userId,
      type: template?.type || override.type || "CUSTOM",
      title,
      message,
      data: meta,
      scheduledAt,
      isSent: false,
    },
  });

  if (scheduledAt <= now) {
    await queue.add("send", { notificationId: notif.id });
  }

  return notif;
}

module.exports = { notifyUser, NOTIFICATION_TEMPLATES };