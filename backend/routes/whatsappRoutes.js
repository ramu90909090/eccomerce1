const express = require("express");
const router = express.Router();
const controller = require("../controllers/whatsappAdminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/status", controller.getSessionStatus);
router.post("/reconnect", controller.reconnectSession);
router.post("/new-session", controller.startNewSession);
router.post("/logout", controller.logoutSession);
router.get("/logs", controller.getWhatsappLogs);
router.post("/retry/:id", controller.retryMessage);
router.post("/bulk-delete", controller.bulkDeleteLogs);

module.exports = router;