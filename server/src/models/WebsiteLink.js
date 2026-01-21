import mongoose from 'mongoose';

const websiteLinkSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
    timestamps: true,
    bufferCommands: false 
});

const WebsiteLink = mongoose.models.WebsiteLink || mongoose.model('WebsiteLink', websiteLinkSchema);
export default WebsiteLink;
