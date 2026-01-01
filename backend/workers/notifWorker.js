const { Worker } = require("bullmq");
const { queue, connection } = require("../queue/notificationQueue");
const prisma = require("../db/prisma");
const admin = require("../db/firebase");

// worker harus dikasih 'connection' langsung
new Worker(
  "push-notification",
  async (job) => {
    const { notificationId } = job.data;

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: { include: { deviceTokens: true } } },
    });

    if (!notif) return;

    const tokens = notif.user.deviceTokens.map(t => t.fcmToken);

    if (!tokens.length) {
      await prisma.notification.update({ where: { id: notif.id }, data: { isSent: true } });
      return;
    }

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: notif.title, body: notif.message },
      data: notif.data || {},
    });

    await prisma.notification.update({
      where: { id: notif.id },
      data: { isSent: true, sentAt: new Date() },
    });
  },
  { connection } // <-- connection valid
);
