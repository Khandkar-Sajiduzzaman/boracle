import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({

    resourceTitle: {
        type: String,
        required: true
    },
    resourceLink: {
        type: String,
        required: true,
        match: [/^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w.-]*)*\/?$/, "Please enter a valid URL"]
    },
    resourceUpvotes: {
        type: Number,
        default: 0
    },
    resourceDownvotes: {
        type: Number,
        default: 0
    },
    isResourceVetted: {
        type: Boolean,
        default: false
    },
    resourceSubmittedBy: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@(g\.)?bracu\.ac\.bd$/, "Please use a valid BRACU G-Suite email address"]
    }
})

const Resource = mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
export default Resource;
