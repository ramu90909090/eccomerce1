const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const cmsController = require("../controllers/contactCmsController");
const crmController = require("../controllers/contactCrmController");
const { querySubmissionRules, cmsConfigUpdateRules, validate } = require("../validators/contactValidator");

// --- Public Endpoints ---
router.get("/config", cmsController.getContactConfig);
router.post("/query", querySubmissionRules, validate, crmController.submitQuery);

// --- Admin Protected Endpoints ---
const adminAuth = [authMiddleware, roleMiddleware("admin")];

// CMS Controls
router.put("/config/general", adminAuth, cmsConfigUpdateRules, validate, cmsController.updateGeneralConfig);
router.post("/config/cards", adminAuth, cmsController.addCard);
router.put("/config/cards/:cardId", adminAuth, cmsController.updateCard);
router.delete("/config/cards/:cardId", adminAuth, cmsController.deleteCard);

router.post("/config/faqs", adminAuth, cmsController.addFaq);
router.put("/config/faqs/:faqId", adminAuth, cmsController.updateFaq);
router.delete("/config/faqs/:faqId", adminAuth, cmsController.deleteFaq);

// CRM Ticket Controls
router.get("/queries", adminAuth, crmController.getAllQueries);
router.patch("/queries/:id", adminAuth, crmController.updateQueryStatus);
router.delete("/queries/:id", adminAuth, crmController.deleteQuery);

module.exports = router;