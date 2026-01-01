const express = require("express");
const router = express.Router();
const {
  createConsultation,
  getUserConsultations,
  getDoctorConsultations,
  getPatientSummary,
  updateConsultationStatus,
  getDoctorSchedule,
  getDoctorsList
} = require("../controllers/ConsultationController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);

router.post("/", createConsultation);
router.get("/user", getUserConsultations);
router.get("/doctorlist", getDoctorsList);
router.get("/doctor", getDoctorConsultations);
router.get("/doctorschedule", getDoctorSchedule);
router.get("/:id/patient", getPatientSummary);
router.patch("/:id/status", updateConsultationStatus);

module.exports = router;
