// models/Category.ts
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
//   slug: { type: String, required: true, unique: true },
//   description: { type: String },
}, { timestamps: true });

// Add index on name for faster sorting and queries
categorySchema.index({ name: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);