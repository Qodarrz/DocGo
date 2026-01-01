// routes/adminDashboard.js
const express = require("express");
const router = express.Router();
const AdminDashboardController = require("../controllers/AdminDashboardController");
const AdminSimpleController = require("../controllers/AdminSimpleController");
const DoctorController = require("../controllers/DoctorController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const upload = require("../service/Multer"); // multer setup

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  authenticate,
  authorizeAdmin,
  AdminDashboardController.getAdminDashboard
);

// DOCTOR ROUTES
router.post(
  "/doctors",
  authenticate,
  authorizeAdmin,
  upload,
  DoctorController.createDoctor
);

router.get(
  "/doctors",
  authenticate,
  authorizeAdmin,
  DoctorController.getAllDoctors
);

router.get(
  "/doctors/:id",
  authenticate,
  authorizeAdmin,
  DoctorController.getDoctorById
);

router.patch(
  "/doctors/:id",
  authenticate,
  authorizeAdmin,
  upload,
  DoctorController.updateDoctor
);

router.delete(
  "/doctors/:id",
  authenticate,
  authorizeAdmin,
  DoctorController.deleteDoctor
);

router.get(
  "/doctors/:id/stats",
  authenticate,
  authorizeAdmin,
  DoctorController.getDoctorStats
);

router.get(
  "/doctors/search",
  authenticate,
  authorizeAdmin,
  DoctorController.searchDoctors
);

router.get(
  "/doctors/available",
  authenticate,
  authorizeAdmin,
  DoctorController.getAvailableDoctors
);

router.post("/app", AdminSimpleController.createAppRelease);
router.get("/app", AdminSimpleController.listAppReleases);
router.get("/app/active", AdminSimpleController.getActiveAppRelease);
router.patch("/app/:id", AdminSimpleController.updateAppRelease);
router.delete("/app/:id", AdminSimpleController.deleteAppRelease);

module.exports = router;
