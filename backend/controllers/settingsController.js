const SiteSettings = require("../models/SiteSettings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({});
    }

    const body = req.body.settingsData ? JSON.parse(req.body.settingsData) : req.body;

    // Handle uploaded images (Navbar logo, Footer logo, Custom QR image)
    if (req.files) {
      if (req.files.navbarLogo) {
        body.navbar.logoUrl = `/uploads/products/${req.files.navbarLogo[0].filename}`;
      }
      if (req.files.footerLogo) {
        body.footer.logoUrl = `/uploads/products/${req.files.footerLogo[0].filename}`;
      }
      if (req.files.paymentQrFile) {
        if (!body.paymentGateway) body.paymentGateway = {};
        body.paymentGateway.qrImageUrl = `/uploads/products/${req.files.paymentQrFile[0].filename}`;
      }
    }

    Object.assign(settings, body);
    await settings.save();

    res.status(200).json({
      success: true,
      message: "Site settings & Payment QR updated successfully!",
      data: settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};