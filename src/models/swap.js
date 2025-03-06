import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({

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
    requestedSwaps: {
        type: Array,
        default: [],
        required: true,
    },
    interestedSwaps: {
        type: Array,
        default: [],
        required: true,
    },
    doneSwaps: {
        type: Array,
        default: [],
        required: true,
    },

})

// Check if model exists to prevent recompilation during hot reload
const Swap = mongoose.models.Swap || mongoose.model('Swap', swapSchema);

export default Swap;