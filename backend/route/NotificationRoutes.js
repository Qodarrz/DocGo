const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");

const { authenticate } = require("../middleware/auth");
router.use(authenticate);

router.get("/", notificationController.getNotifications);

router.get("/:id", notificationController.getNotificationById);

router.patch("/read/:id", notificationController.markAsRead);

module.exports = router;
