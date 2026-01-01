const { Worker } = require("bullmq");
const prisma = require("../db/prisma");
const admin = require("../db/firebase");
const { shouldRunReminder } = require("../controllers/ReminderController");
const { notifyUser } = require("../helper/notif");

function startReminderWorker() {
  console.log("Reminder Worker starting...");

  new Worker(
    "reminder-notification",
    async (job) => {
      const { reminderId } = job.data;
      const now = new Date();

      // Ambil reminder beserta device tokens user
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: { user: { include: { deviceTokens: true } } },
      });

      if (!reminder) return console.log("Reminder not found:", reminderId);
      if (!shouldRunReminder(reminder, now))
        return console.log("Reminder skipped:", reminderId);

      const tokens = reminder.user.deviceTokens.map((t) => t.fcmToken);

      if (tokens.length > 0) {
        try {
          // Debug sebelum dikirim
          console.log("=== Preparing FCM Reminder ===");
          console.log("Reminder ID:", reminder.id);
          console.log("Title:", reminder.title);
          console.log("Body:", reminder.message);
          console.log("User Tokens:", tokens);

          const fcmPayload = {
            type: "REMINDER",
            reminderId: reminder.id.toString(),
            title: reminder.title || "",
            body: reminder.message || "",
            ...(reminder.data && typeof reminder.data === "object"
              ? reminder.data
              : {}),
          };

          console.log("Data Payload:", fcmPayload);

          // Kirim data-only FCM
          const response = await admin.messaging().sendEachForMulticast({
            tokens,
            data: fcmPayload,
            android: { priority: "high" },
          });

          console.log("FCM reminder response:", response);
        } catch (err) {
          console.error("FCM error:", err);
        }
      }

      // Update lastRunAt
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { lastRunAt: now },
      });

      console.log("lastRunAt updated for reminder:", reminderId, "at", now);
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }
  );
}

module.exports = { startReminderWorker };
