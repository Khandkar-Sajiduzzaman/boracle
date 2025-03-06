import mongoose from 'mongoose';

const userInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
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
    default: "peasant",
  },
  // Add more fields as needed
}, { timestamps: true });

// Check if model exists to prevent recompilation during hot reload
const UserInfo = mongoose.models.UserInfo || mongoose.model('UserInfo', userInfoSchema);

export default UserInfo;