import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@(g\.)?bracu\.ac\.bd$/,
      "Please use a valid BRACU G-Suite email address",
    ],
  },

  requestedSwaps: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Each swap gets its own ObjectId
      offeredCourse: { type: String, required: true },
      requestedCourse: { type: String, required: true },
      status: { type: String, enum: ["pending", "approved", "completed"], default: "pending" },
      interestedStudents: [{ type: String }], // Store interested students' emails
      approvedStudent: { type: String, default: null }, // Email of the student who got the swap
    },
  ],

  interestedSwaps: [
    {
      swapId: { type: mongoose.Schema.Types.ObjectId }, // Store the _id of the requested swap
      requestorEmail: { type: String },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    },
  ],

  doneSwaps: [
    {
      swapId: { type: mongoose.Schema.Types.ObjectId }, // Store the _id of the completed swap
      completedWith: { type: String }, // Email of the student swap was completed with
      completedAt: { type: Date, default: Date.now },
    },
  ],
});

// Prevent recompilation during hot reload
const Swap = mongoose.models.Swap || mongoose.model("Swap", swapSchema);

export default Swap;
