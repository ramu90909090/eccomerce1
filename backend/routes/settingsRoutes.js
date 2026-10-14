const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { getSettings, updateSettings } = require("../controllers/settingsController");

router.get("/", getSettings);

router.put(
  "/",
  upload.fields([
    { name: "navbarLogo", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
    { name: "paymentQrFile", maxCount: 1 } // <-- Dynamic QR upload support
  ]),
  updateSettings
);

module.exports = router;