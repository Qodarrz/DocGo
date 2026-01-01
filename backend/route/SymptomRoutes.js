const express = require("express");
const router = express.Router();
const symptomController = require("../controllers/SymptomController");
const { authenticate } = require("../middleware/auth");
const requireMedicalProfile = require("../middleware/medicalprofile");

router.use(authenticate);

router.post(
  "/analyze",
  requireMedicalProfile,
  symptomController.analyze
);

router.get("/history", symptomController.getHistory);
router.get("/analytics", symptomController.getAnalytics);
router.get("/:recordId", symptomController.getRecord);

router.post("/track", symptomController.trackManual);
router.post("/emergency-check", symptomController.emergencyCheck);
router.post(
  "/doctor-recommendations",
  symptomController.getDoctorRecommendations
);

module.exports = router;
