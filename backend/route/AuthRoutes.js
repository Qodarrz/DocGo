const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/verify", authController.verifyEmail);
router.post("/resend-otp", authController.resendOtp);

router.post("/request-password-reset", authController.requestPasswordReset);
router.get("/check-reset-token/:token", authController.checkResetToken);
router.post("/reset-password", authController.resetPassword);
router.post("/register-device", authController.registerDeviceToken);

module.exports = router;
