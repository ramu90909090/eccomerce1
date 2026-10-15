const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 1. Get All Users (With Pagination, Search & Filters)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, isVerified, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search by Name, Email, Mobile or District
    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { name: regex },
        { email: regex },
        { mobile: regex },
        { district: regex }
      ];
    }

    // Role Filter
    if (role && role !== "All") {
      query.role = role;
    }

    // Verification Status Filter
    if (isVerified && isVerified !== "All") {
      query.isVerified = isVerified === "true";
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      User.countDocuments(query)
    ]);

    // Live Metrics / KPI counts
    const [totalAdmins, totalCustomers, verifiedCount] = await Promise.all([
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ isVerified: true })
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / perPage) || 1,
        currentPage,
        limit: perPage
      },
      stats: {
        totalUsers,
        totalAdmins,
        totalCustomers,
        verifiedCount
      }
    });
  } catch (error) {
    console.error("getAllUsers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create User Manually (Admin Add User)
exports.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role, isVerified, address, district, state, pincode } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: "Email aur password anivarya hain." });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ success: false, message: "Yeh email pehle se registered hai." });
    }

    const newUser = await User.create({
      name,
      email: cleanEmail,
      mobile: mobile || "N/A",
      password,
      role: role || "user",
      isVerified: isVerified === true || isVerified === "true",
      address: address || "",
      district: district || "",
      state: state || "Uttar Pradesh",
      pincode: pincode || ""
    });

    res.status(201).json({
      success: true,
      message: "User safaltapoorvak create ho gaya!",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update User (Edit Role, Details & Verification)
exports.updateUser = async (req, res) => {
  try {
    const { name, mobile, role, isVerified, address, district, state, pincode, password } = req.body;

    let updateFields = {
      name,
      mobile,
      role,
      isVerified: isVerified === true || isVerified === "true",
      address,
      district,
      state,
      pincode
    };

    // Agar admin ne new password diya ho
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password.trim(), salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User account nahi mila." });
    }

    res.status(200).json({
      success: true,
      message: "User details update ho gayi!",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User nahi mila." });
    }

    // Protection: Khud ko delete na karne de
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: "Aap apna khud ka account delete nahi kar sakte." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User account delete kar diya gaya." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};