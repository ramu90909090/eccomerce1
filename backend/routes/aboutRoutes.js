const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const aboutController = require("../controllers/aboutCmsController");
const { aboutConfigUpdateRules, validate } = require("../validators/aboutValidator");

const adminAuth = [authMiddleware, roleMiddleware("admin")];

// Public Route
router.get("/config", aboutController.getAboutConfig);

// Admin CMS Routes
router.put("/config/general", adminAuth, aboutConfigUpdateRules, validate, aboutController.updateGeneralSections);

// Stats
router.post("/config/stats", adminAuth, aboutController.addStat);
router.put("/config/stats/:statId", adminAuth, aboutController.updateStat);
router.delete("/config/stats/:statId", adminAuth, aboutController.deleteStat);

// Infrastructure (Multi-image)
router.post("/config/infrastructure", adminAuth, aboutController.addInfraItem);
router.put("/config/infrastructure/:infraId", adminAuth, aboutController.updateInfraItem);
router.delete("/config/infrastructure/:infraId", adminAuth, aboutController.deleteInfraItem);
router.patch("/config/infrastructure/:infraId/images/:imageIndex/toggle", adminAuth, aboutController.toggleInfraImageActive);

// Pillars
router.post("/config/pillars", adminAuth, aboutController.addPillar);
router.put("/config/pillars/:pillarId", adminAuth, aboutController.updatePillar);
router.delete("/config/pillars/:pillarId", adminAuth, aboutController.deletePillar);

// Milestones
router.post("/config/milestones", adminAuth, aboutController.addMilestone);
router.put("/config/milestones/:milestoneId", adminAuth, aboutController.updateMilestone);
router.delete("/config/milestones/:milestoneId", adminAuth, aboutController.deleteMilestone);

module.exports = router;