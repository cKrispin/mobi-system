import express from "express";
import { createFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/feedback
 * @desc    Create new feedback
 * @access  Private
 */
router.post("/", protect, createFeedback);

/**
 * @route   GET /api/feedback/all
 * @desc    Get all feedback entries
 * @access  Private
 */
router.get("/all", protect, getAllFeedback);

export default router;