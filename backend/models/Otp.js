const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  purpose: { 
    type: String, 
    enum: ["registration", "login", "forgot_password"], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 180 // 180 seconds = 3 minutes auto expire
  }
});

module.exports = mongoose.model("Otp", otpSchema);