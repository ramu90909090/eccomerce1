const User = require("../models/User");
const Otp = require("../models/Otp");
const SiteSettings = require("../models/SiteSettings");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Dynamic Store Name Helper
const getDynamicStoreName = async () => {
  try {
    const settings = await SiteSettings.findOne();
    return settings?.navbar?.brandName || "KHASTORE";
  } catch (err) {
    return "KHASTORE";
  }
};

// ==========================================
// 1. REGISTER (Validate & Send Registration OTP)
// ==========================================
exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Valid email address is required" });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email pehle se registered hai. Kripya login karein." });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const storeName = await getDynamicStoreName();

    await Otp.deleteMany({ email: cleanEmail, purpose: "registration" });
    await Otp.create({ email: cleanEmail, otp: hashedOtp, purpose: "registration" });

    await sendEmail({
      to: cleanEmail,
      subject: `Your Registration OTP - ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ec4899;">${storeName} Account Verification</h2>
          <p>Apna naya account verify karne ke liye niche diya gaya OTP enter karein:</p>
          <div style="font-size: 26px; font-weight: bold; color: #7c3aed; letter-spacing: 4px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 13px;">Yeh code sirf <b>3 minutes</b> ke liye valid hai.</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "OTP aapke email par bhej diya gaya hai. Kripya 3 minute ke andar verify karein."
    });
  } catch (error) {
    console.error("register Error:", error);
    res.status(500).json({ success: false, message: error.message || "Registration initiate karne me server error aaya." });
  }
};

// ==========================================
// 2. VERIFY REGISTRATION OTP & CREATE USER
// ==========================================
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp, userData } = req.body;

    if (!email || !otp || !userData) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP aur user details sabhi required hain."
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Yeh email pehle se registered hai. Kripya login karein."
      });
    }

    const otpDoc = await Otp.findOne({ email: cleanEmail, purpose: "registration" });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "OTP expire ho gaya hai (3-minute time limit). Kripya 'Resend OTP' par click karein."
      });
    }

    const isValid = await bcrypt.compare(cleanOtp, otpDoc.otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Galat OTP enter kiya gaya hai."
      });
    }

    const { confirmPassword, ...validUserData } = userData;

    const newUser = await User.create({
      name: validUserData.name,
      email: cleanEmail,
      mobile: validUserData.mobile,
      address: validUserData.address,
      pincode: validUserData.pincode,
      state: validUserData.state,
      district: validUserData.district,
      password: validUserData.password,
      isVerified: true,
      role: "user"
    });

    await Otp.deleteMany({ email: cleanEmail, purpose: "registration" });

    res.status(201).json({
      success: true,
      message: "Account safaltapoorvak ban gaya hai! Ab login karein.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("verifyRegistrationOtp Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration verify karne me server error aaya."
    });
  }
};

// ==========================================
// 3. LOGIN (Verify Credentials & Send OTP)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email ya password." });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const storeName = await getDynamicStoreName();

    await Otp.deleteMany({ email: cleanEmail, purpose: "login" });
    await Otp.create({ email: cleanEmail, otp: hashedOtp, purpose: "login" });

    await sendEmail({
      to: cleanEmail,
      subject: `Login Verification OTP - ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ec4899;">${storeName} Secure Login</h2>
          <p>Login complete karne ke liye 2-Step verification OTP:</p>
          <div style="font-size: 26px; font-weight: bold; color: #7c3aed; letter-spacing: 4px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 13px;">Yeh code sirf <b>3 minutes</b> ke liye valid hai.</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "Login verification OTP aapke registered email par bhej diya gaya hai."
    });
  } catch (error) {
    console.error("login Error:", error);
    res.status(500).json({ success: false, message: error.message || "Login initiate karne me error aaya." });
  }
};

// ==========================================
// 4. VERIFY LOGIN OTP & ISSUE HTTP-ONLY COOKIE
// ==========================================
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();

    const otpDoc = await Otp.findOne({ email: cleanEmail, purpose: "login" });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "OTP expire ho gaya hai. Resend karein." });
    }

    const isValid = await bcrypt.compare(cleanOtp, otpDoc.otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Galat OTP enter kiya gaya hai." });
    }

    const user = await User.findOne({ email: cleanEmail }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User account exist nahi karta." });
    }

    await Otp.deleteMany({ email: cleanEmail, purpose: "login" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user
    });
  } catch (error) {
    console.error("verifyLoginOtp Error:", error);
    res.status(500).json({ success: false, message: error.message || "Login verify karne me error aaya." });
  }
};

// ==========================================
// 5. RESEND OTP (3-Minute Fresh Window)
// ==========================================
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !purpose) {
      return res.status(400).json({ success: false, message: "Email aur purpose zaroori hain." });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const storeName = await getDynamicStoreName();

    await Otp.deleteMany({ email: cleanEmail, purpose });
    await Otp.create({ email: cleanEmail, otp: hashedOtp, purpose });

    await sendEmail({
      to: cleanEmail,
      subject: `Resent OTP [${purpose.toUpperCase()}] - ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ec4899;">${storeName} Fresh Security OTP</h2>
          <p>Aapka naya verification code:</p>
          <div style="font-size: 26px; font-weight: bold; color: #7c3aed; letter-spacing: 4px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 13px;">Valid for <b>3 minutes</b> only.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "Naya OTP email par bhej diya gaya hai." });
  } catch (error) {
    console.error("resendOtp Error:", error);
    res.status(500).json({ success: false, message: error.message || "OTP resend karne me error aaya." });
  }
};

// ==========================================
// 6. FORGOT PASSWORD (Request Reset OTP)
// ==========================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "Yeh email kisi registered account se match nahi karta." });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const storeName = await getDynamicStoreName();

    await Otp.deleteMany({ email: cleanEmail, purpose: "forgot_password" });
    await Otp.create({ email: cleanEmail, otp: hashedOtp, purpose: "forgot_password" });

    await sendEmail({
      to: cleanEmail,
      subject: `Password Reset OTP - ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ec4899;">${storeName} Password Reset Request</h2>
          <p>Password reset verify karne ke liye code:</p>
          <div style="font-size: 26px; font-weight: bold; color: #7c3aed; letter-spacing: 4px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 13px;">Yeh code sirf <b>3 minutes</b> tak chalega.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "Password reset OTP email par bhej diya gaya hai." });
  } catch (error) {
    console.error("forgotPassword Error:", error);
    res.status(500).json({ success: false, message: error.message || "Forgot password process me error aaya." });
  }
};

// ==========================================
// 7. RESET PASSWORD (Verify OTP & Update)
// ==========================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Naya password kam se kam 6 characters ka hona chahiye." });
    }

    const otpDoc = await Otp.findOne({ email: cleanEmail, purpose: "forgot_password" });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "OTP expire ho gaya hai. Dobara request karein." });
    }

    const isValid = await bcrypt.compare(cleanOtp, otpDoc.otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Galat OTP enter kiya gaya hai." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account nahi mila." });
    }

    user.password = newPassword;
    await user.save();

    await Otp.deleteMany({ email: cleanEmail, purpose: "forgot_password" });

    res.status(200).json({
      success: true,
      message: "Password update ho gaya hai! Ab aap naye password se login kar sakte hain."
    });
  } catch (error) {
    console.error("resetPassword Error:", error);
    res.status(500).json({ success: false, message: error.message || "Password reset update me error aaya." });
  }
};

// ==========================================
// 8. GOOGLE LOGIN (OAuth 2.0)
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential token missing hai." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;
    const cleanEmail = String(email).trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: cleanEmail,
        mobile: "N/A",
        address: "Google Sign-In Account",
        pincode: "000000",
        state: "N/A",
        district: "N/A",
        password: crypto.randomBytes(16).toString("hex"),
        isVerified: true,
        role: "user"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Google login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("googleLogin Error:", error);
    res.status(500).json({ success: false, message: "Google authentication verify karne me fail ho gaya." });
  }
};

// ==========================================
// 9. GET LOGGED-IN USER PROFILE
// ==========================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(200).json({ success: false, data: null, user: null });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User nahi mila." });
    }

    res.status(200).json({
      success: true,
      data: user,
      user
    });
  } catch (error) {
    console.error("getProfile Error:", error);
    res.status(500).json({ success: false, message: "Profile load karne me error aaya." });
  }
};

// ==========================================
// 10. UPDATE LOGGED-IN USER PROFILE
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Kripya login karein." });
    }

    const { name, mobile, address, district, city, pincode, state } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        mobile,
        address,
        district: district || city,
        city: city || district,
        pincode,
        state
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User account exist nahi karta." });
    }

    res.status(200).json({
      success: true,
      message: "Profile details successfully update ho gayi!",
      data: updatedUser,
      user: updatedUser
    });
  } catch (error) {
    console.error("updateProfile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Profile update karte samay server error aaya."
    });
  }
};

// ==========================================
// 11. LOGOUT
// ==========================================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};