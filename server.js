import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
//import helmet from "helmet";
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

/* SECURITY MIDDLEWARES */
app.use(cors({
	origin: "*"
}));

app.use(express.json());

/* INPUT SANITIZATION (SAFE VERSION) */
app.use((req, res, next) => {
	function clean(obj) {
		if (!obj || typeof obj !== "object") return obj;

		for (let key in obj) {
			if (key.startsWith("$") || key.includes(".")) {
				delete obj[key];
			} else if (typeof obj[key] === "object") {
				clean(obj[key]);
			}
		}
		return obj;
	}

	req.body = clean(req.body);
	req.params = clean(req.params);

	next();
});

/* RATE LIMIT */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100
});
app.use(limiter);

/* STATIC FILES */
app.use(express.static("public"));

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users",userRoutes);

/* DB + SERVER */
mongoose.connect(process.env.MONGO_URI)
.then(() => {
	console.log("MongoDB Connected");

	app.listen(process.env.PORT || 5000, () => {
		console.log(`Server running`);
	});
})
.catch(err => console.log(err));

/* ERROR HANDLER */
app.use((err, req, res, next) => {
	console.error(err);

	res.status(500).json({
		success: false,
		message: "Internal server error"
	});
});