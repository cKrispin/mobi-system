import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

/* ROUTES */
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import gpsRoutes from "./routes/gpsRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   SECURITY MIDDLEWARES
========================= */

app.use(helmet());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   INPUT SANITIZATION
========================= */

app.use((req, res, next) => {
  function clean(obj) {
    if (!obj || typeof obj !== "object") return obj;

    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        clean(obj[key]);
      }
    }

    return obj;
  }

  if (req.body) req.body = clean(req.body);

  // DO NOT overwrite req.query or req.params
  req.cleanedQuery = req.query ? clean({ ...req.query }) : {};
  req.cleanedParams = req.params ? clean({ ...req.params }) : {};

  next();
});

/* =========================
   RATE LIMITING
========================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use(limiter);

/* =========================
   STATIC FILES
========================= */

app.use(express.static("public"));

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    app: "MOBI API",
    status: "running",
    environment: process.env.NODE_ENV || "development"
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

/* =========================
   DATABASE CONNECTION
========================= */

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    process.exit(1);
  }
}

startServer();