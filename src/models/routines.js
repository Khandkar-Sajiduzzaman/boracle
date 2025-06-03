import mongoose from 'mongoose';

const routineSchema = new mongoose.Schema({
    userId: { // User ObjectId
      type: String,
      required: true,
      index: true,
    },
    routineJSON: { // JSON object containing routine data
      type: Object,
      required: true,
    },
    isPinned: { // Boolean to indicate if the routine is pinned
      type: Boolean,
      default: false,
    },

}, { timestamps: true } // Automatically manage createdAt and updatedAt fields
)

// Check if model exists to prevent recompilation during hot reload
const Routine = mongoose.models.Routine || mongoose.model('Routine', routineSchema);

export default Routine;