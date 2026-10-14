const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Controllers, Validators & Middlewares
const authController = require("../controllers/authController");
const { registerValidationRules, validate } = require("../validators/authValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// 1. Auth & Registration Routes
router.post("/register", ...registerValidationRules, validate, authController.register);
router.post("/verify-registration-otp", authController.verifyRegistrationOtp);
router.post("/login", authController.login);
router.post("/verify-login-otp", authController.verifyLoginOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google", authController.googleLogin);

// 2. Profile Fetch Route (Token Cookie / Bearer Header Support)
router.get("/profile", async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(200).json({ success: false, data: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(200).json({ success: false, data: null });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(200).json({ success: false, data: null });
  }
});

// 3. Protected Dashboard Route
router.get("/admin-dashboard", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome to Admin Control Hub" });
});

module.exports = router;