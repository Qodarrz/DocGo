const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DoctorDashboardController");
const { authenticate } = require("../middleware/auth");

// Dashboard routes
router.get("/dashboard", authenticate, DashboardController.getDoctorDashboard);

module.exports = router;