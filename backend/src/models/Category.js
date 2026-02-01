import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: String,
  // Kind allows distinguishing regular product categories from occasion tags
  kind: {
    type: String,
    enum: ['category', 'occasion'],
    default: 'category'
  },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
