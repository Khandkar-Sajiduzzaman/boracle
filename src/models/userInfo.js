import mongoose from 'mongoose';

const userInfoSchema = new mongoose.Schema({
  email: {
    //G-Suite Email
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
  name: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    default: "Spring 2024",
  },
  role: {
    type: String,
    default: "user",
  },
  // Add more fields as needed
}, { timestamps: true });

// Check if model exists to prevent recompilation during hot reload
const User = mongoose.models.User || mongoose.model('User', userInfoSchema);

export default User;