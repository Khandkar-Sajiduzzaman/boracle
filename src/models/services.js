import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        required: true
    }

}, { timestamps: true });

export default mongoose.models.Service || mongoose.model("Service", serviceSchema);