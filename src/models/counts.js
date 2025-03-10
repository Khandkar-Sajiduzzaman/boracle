import mongoose from "mongoose";

const countSchema = new mongoose.Schema({
    swapsPosted: {
        type: Number,
        default: 0
    },
    swapsCompleted: {
        type: Number,
        default: 0
    },
    swapsInProgress: {
        type: Number,
        default: 0
    },
    facultyReviews: {
        type: Number,
        default: 0
    },
    resourcesSubmitted: {
        type: Number,
        default: 0
    }
});

export default mongoose.models.Count || mongoose.model("Count", countSchema);
