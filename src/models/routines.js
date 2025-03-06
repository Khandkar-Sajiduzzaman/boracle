import mongoose from 'mongoose';

const routineSchema = new mongoose.Schema({
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
  
 routine: {
    type: Array,
    default: [],
    required: true,
},

}
)

// Check if model exists to prevent recompilation during hot reload
const Routine = mongoose.models.Routine || mongoose.model('Routine', routineSchema);

export default Routine;