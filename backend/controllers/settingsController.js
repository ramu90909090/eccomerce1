const SiteSettings = require("../models/SiteSettings");

// 1. Get Settings (Public)
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      // First time initial default instance create karein
      settings = await SiteSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Settings (Admin Only)
exports.updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({});
    }

    // Handle parsed JSON payload if sent via FormData
    const body = req.body.settingsData ? JSON.parse(req.body.settingsData) : req.body;

    // Check if new navbar/footer logo uploaded via multer
    if (req.files && req.files.navbarLogo) {
      body.navbar.logoUrl = `/uploads/products/${req.files.navbarLogo[0].filename}`;
    }
    if (req.files && req.files.footerLogo) {
      body.footer.logoUrl = `/uploads/products/${req.files.footerLogo[0].filename}`;
    }

    Object.assign(settings, body);
    await settings.save();

    res.status(200).json({
      success: true,
      message: "Navbar and Footer configuration updated successfully",
      data: settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};