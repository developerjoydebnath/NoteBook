import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // Rich text editor content
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, trim: true }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
    timestamps: true,
    bufferCommands: false 
});

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default Note;
