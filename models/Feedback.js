import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
	user: { type: String, required: true },

	routeFeedback: {
		type: String,
		enum: ["general", "traffic", "navigation"],
		required: true,
		default: "general"
	},

	alertFeedback: {
		type: String,
		enum: ["none", "wrong_info", "late_update"],
		required: true,
		default: "none"
	},

	improvementFeedback: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 500,
		trim: true
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;