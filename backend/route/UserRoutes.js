const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authenticate } = require("../middleware/auth");
const requireMedicalProfile = require("../middleware/medicalprofile");

const upload = require("../service/Multer"); // multer setup
router.use(authenticate);

router.get("/", userController.getMe);

router.patch("/", upload, userController.updateMe);

router.get("/medical-profile", userController.getMedicalProfile);

router.patch("/medical-profile", userController.upsertMedicalProfile);

router.get("/summary", requireMedicalProfile, userController.getSummary);

module.exports = router;
