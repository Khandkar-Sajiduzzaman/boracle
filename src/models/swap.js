import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  //Swap object id mongoose.Types.ObjectId
  offerCourseCode: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}\d{3}$/, "Please enter a valid course code (e.g., CSE101)"]
  },
  offerCourseSection: {
    type: Number,
    required: true,
    min: 1
  },
  requestCourseCode: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}\d{3}$/, "Please enter a valid course code (e.g., CSE101)"]
  },
  requestCourseSection: {
    type: Number,
    required: true,
    min: 1
  },
  swapAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  intestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  swapStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  }


}, { timestamps: true});

// Prevent recompilation during hot reload
const Swap = mongoose.models.Swap || mongoose.model("Swap", swapSchema);

export default Swap;
