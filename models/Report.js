import mongoose from "mongoose";

const reportSchema =
  new mongoose.Schema({

    location: String,

    description: String,

    createdAt: {
      type: Date,
      default: Date.now
    }

  });

export default mongoose.model(
  "Report",
  reportSchema
);