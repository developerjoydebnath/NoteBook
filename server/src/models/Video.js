import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    embedUrl: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
    bufferCommands: false
});

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);
export default Video;
