// import Feedback from "../models/Feedback.js";

// export async function createFeedback(req, res) {
// 	try {
// 		const {
// 			routeFeedback,
// 			alertFeedback,
// 			improvementFeedback
// 		} = req.body;

// 		// Optional debug
// 		console.log("REQ BODY:", req.body);

// 		const feedback = await Feedback.create({
// 			user: req.user?.id || "anonymous",
// 			routeFeedback,
// 			alertFeedback,
// 			improvementFeedback
// 		});

// 		res.json({
// 			success: true,
// 			feedback
// 		});

// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			error: error.message
// 		});
// 	}
// }

// export async function getAllFeedback(req,res){

// 	try{

// 		const feedback = await Feedback.find()

// 		.sort({

// 			createdAt:-1

// 		});

// 		res.json({

// 			success:true,

// 			count:feedback.length,

// 			feedback

// 		});

// 	}

// 	catch(error){

// 		res.status(500).json({

// 			success:false,

// 			error:error.message

// 		});

// 	}

// }


import Feedback from "../models/Feedback.js";

/**
 * @desc    Create feedback
 * @route   POST /api/feedback
 * @access  Private
 */
export const createFeedback = async (req, res) => {
  try {
    const { routeFeedback, alertFeedback, improvementFeedback } = req.body;

    const feedback = await Feedback.create({
      user: req.user?.id,
      routeFeedback,
      alertFeedback,
      improvementFeedback,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all feedback
 * @route   GET /api/feedback/all
 * @access  Private
 */
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};