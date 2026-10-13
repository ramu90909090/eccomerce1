const { body, validationResult } = require("express-validator");

const querySubmissionRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 80 })
    .withMessage("Name cannot exceed 80 characters")
    .escape(),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\s-]{8,15}$/)
    .withMessage("Invalid phone format")
    .escape(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Inquiry type/subject is required")
    .escape(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message length must be between 10 and 2000 characters")
    .escape()
];

const cmsConfigUpdateRules = [
  body("banner.heading").optional().trim().escape(),
  body("banner.description").optional().trim().escape(),
  body("banner.tagline").optional().trim().escape(),
  body("mapConfig.locationTitle").optional().trim().escape(),
  body("mapConfig.visitingHours").optional().trim().escape(),
  body("mapConfig.embedUrl").optional().trim()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  querySubmissionRules,
  cmsConfigUpdateRules,
  validate
};