import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['note', 'website'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Ensure unique category names per user and type
categorySchema.index({ name: 1, type: 1, userId: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
