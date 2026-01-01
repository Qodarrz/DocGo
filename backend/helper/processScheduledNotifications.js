const prisma = require("../db/prisma");
const { queue } = require("../queue/notificationQueue");

async function processScheduledNotifications() {
  const now = new Date();
  const notifications = await prisma.notification.findMany({
    where: { isSent: false, OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
  });

  for (const notif of notifications) {
    await queue.add("send", { notificationId: notif.id }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
  }
}

module.exports = { processScheduledNotifications };
