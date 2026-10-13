const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { getSettings, updateSettings } = require("../controllers/settingsController");

router.get("/", getSettings);

// Multiple named files support (navbarLogo, footerLogo)
router.put(
  "/",
  upload.fields([
    { name: "navbarLogo", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 }
  ]),
  updateSettings
);

module.exports = router;