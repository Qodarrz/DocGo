const express = require("express");
const router = express.Router();
const {
  createReminder,
  listReminders,
  updateReminder,
  deleteReminder,
  getRemindersByDate,
} = require("../controllers/ReminderController");

const { authenticate } = require("../middleware/auth");
router.use(authenticate);

router.post("/", createReminder);

router.get("/", listReminders);

router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.get("/date", getRemindersByDate);

module.exports = router;
