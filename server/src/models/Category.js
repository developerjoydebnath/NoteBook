import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['note', 'website', 'video'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
    bufferCommands: false
});

// Ensure unique category names per user and type
categorySchema.index({ name: 1, type: 1, userId: 1 }, { unique: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
