const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, ".env") });

const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const aboutRoutes = require("./routes/aboutRoutes");


// Database initialization
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// 1. CORS Configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const corsOptions = {
  origin: clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests from this IP. Please try again after 15 minutes." }
});
app.use("/api", limiter);

// 3. Body & Cookie Parsers
app.use(express.json({ limit: "15kb" }));
app.use(cookieParser());

// 4. Express 5 Safe Mongo Sanitize (No direct req.query reassignment)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const cleanQuery = mongoSanitize.sanitize({ ...req.query });
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, cleanQuery);
  }
  next();
});

// 5. Express 5 Safe XSS Sanitizer (Replaces buggy xss-clean)
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[<>]/g, "");
};

const cleanXSS = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === "object") {
      cleanXSS(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) cleanXSS(req.body);
  if (req.params) cleanXSS(req.params);
  if (req.query) cleanXSS(req.query);
  next();
});

// 6. Parameter Pollution Prevention
app.use(hpp());

// Static files serving for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// 7. Routes Mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/about", aboutRoutes);



// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗 Allowed Client: ${clientUrl}`);
});