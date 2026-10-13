const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { registerValidationRules, validate } = require("../validators/authValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Array ko spread (...) karke lagayein taaki Express router layer break na ho
router.post("/register", ...registerValidationRules, validate, authController.register);
router.post("/verify-registration-otp", authController.verifyRegistrationOtp);
router.post("/login", authController.login);
router.post("/verify-login-otp", authController.verifyLoginOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google", authController.googleLogin);

// Protected Route Example
router.get("/admin-dashboard", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome to Admin Control Hub" });
});

module.exports = router;