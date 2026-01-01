const prisma = require("../db/prisma");
const { queue } = require("../queue/remindersQueue");

async function createReminder(req, res) {
  try {
    const userId = req.user.id;
    const { title, message, type, repeatType, startAt, endAt, cron } = req.body;

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title,
        message,
        type,
        repeatType,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        cron: cron || null,
      },
    });

    res.status(201).json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create reminder" });
  }
}

async function listReminders(req, res) {
  try {
    const userId = req.user.id;

    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { startAt: "asc" },
    });

    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
}

async function updateReminder(req, res) {
  try {
    const userId = req.user.id;
    const reminderId = Number(req.params.id);

    const { title, message, type, repeatType, startAt, endAt, cron, isActive } =
      req.body;

    // Pastikan reminder milik user
    const existing = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        title: title ?? existing.title,
        message: message ?? existing.message,
        type: type ?? existing.type,
        repeatType: repeatType ?? existing.repeatType,
        startAt: startAt ? new Date(startAt) : existing.startAt,
        endAt:
          endAt !== undefined
            ? endAt
              ? new Date(endAt)
              : null
            : existing.endAt,
        cron: cron !== undefined ? cron : existing.cron,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reminder" });
  }
}
async function deleteReminder(req, res) {
  try {
    const userId = req.user.id;
    const reminderId = req.params.id;


    // Pastikan reminder milik user
    const existing = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
}

function shouldRunReminder(reminder, now = new Date()) {
  if (!reminder.isActive) return false;
  if (reminder.startAt > now) return false;
  if (reminder.endAt && reminder.endAt < now) return false;

  const lastRunAt = reminder.lastRunAt ? new Date(reminder.lastRunAt) : null;

  // FIRST RUN (belum pernah jalan)
  if (!lastRunAt) {
    // startAt sudah pasti <= now karena guard di atas
    return reminder.repeatType !== "ONCE" || reminder.startAt <= now;
  }

  switch (reminder.repeatType) {
    case "DAILY":
      return (
        now.getUTCDate() !== lastRunAt.getUTCDate() ||
        now.getUTCMonth() !== lastRunAt.getUTCMonth() ||
        now.getUTCFullYear() !== lastRunAt.getUTCFullYear()
      );

    case "WEEKLY":
      return now - lastRunAt >= 7 * 24 * 60 * 60 * 1000;

    case "MONTHLY":
      return (
        now.getMonth() !== lastRunAt.getMonth() ||
        now.getFullYear() !== lastRunAt.getFullYear()
      );

    case "ONCE":
      return false;

    default:
      return false;
  }
}

async function scheduleReminders() {
  const now = new Date();
  const reminders = await prisma.reminder.findMany({
    where: { isActive: true },
  });

  for (const r of reminders) {
    console.log(
      "Scheduler checking reminder:",
      r.id,
      "startAt:",
      r.startAt,
      "lastRunAt:",
      r.lastRunAt
    );

    if (!shouldRunReminder(r, now)) continue;

    await queue.add(
      "send",
      { reminderId: r.id },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );
    console.log("Scheduler queued reminder:", r.id);
  }
}

function shouldRunReminderTest(reminder, now = new Date()) {
  if (!reminder.isActive) return false;
  if (reminder.startAt > now) return false;
  if (reminder.endAt && reminder.endAt < now) return false;

  return true;
}

async function getRemindersByDate(req, res) {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date query is required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reminders by date" });
  }
}


module.exports = {
  createReminder,
  listReminders,
  getRemindersByDate,
  updateReminder,
  deleteReminder,
  scheduleReminders,
  shouldRunReminder,
  shouldRunReminderTest,
};

