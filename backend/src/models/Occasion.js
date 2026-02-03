import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
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
  // Optional: add image field for occasion-specific imagery
  image: {
    url: String,
    alt: String
  },
  // Optional: add order field for controlling display order
  order: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  // Ensure slug uniqueness across all occasions
  uniqueIndexes: true
});

// Index for efficient lookups
occasionSchema.index({ slug: 1 });
occasionSchema.index({ name: 1 });

export default mongoose.model("Occasion", occasionSchema);