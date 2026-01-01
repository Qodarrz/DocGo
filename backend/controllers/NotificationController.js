const prisma = require("../db/prisma");

/**
 * GET all notifications for authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, isSent } = req.query;

    const filter = { userId };
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (isSent !== undefined) filter.isSent = isSent === "true";

    const notifications = await prisma.notification.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * GET notification by ID and mark as read for authenticated user
 */
const getNotificationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    // Jika belum dibaca, update isRead dan readAt
    if (!notification.isRead) {
      notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("Get notification by ID error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * PATCH mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    if (notification.isRead) {
      return res.json({
        success: true,
        message: "Notifikasi sudah dibaca",
        notification,
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({
      success: true,
      message: "Notifikasi berhasil ditandai sebagai dibaca",
      notification: updated,
    });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
};
