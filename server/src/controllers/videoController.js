import axios from 'axios';
import Video from '../models/Video.js';

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const getVideos = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        const query = { userId: req.user._id };

        if (category && category !== 'all') query.categoryId = category;
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const videos = await Video.find(query)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Video.countDocuments(query);

        res.json({
            videos,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalVideos: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createVideo = async (req, res) => {
    try {
        const { url, categoryId } = req.body;

        const videoId = getYoutubeId(url);
        if (!videoId) {
            return res.status(400).json({ message: 'Invalid YouTube URL' });
        }

        // Fetch video info using YouTube OEmbed API
        let title = 'YouTube Video';
        let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await axios.get(oembedUrl, { timeout: 5000 });
            if (response.data) {
                title = response.data.title;
                thumbnailUrl = response.data.thumbnail_url || thumbnailUrl;
            }
        } catch (fetchError) {
            console.error('Failed to fetch video title:', fetchError.message);
            // Fallback to default title if fetch fails
        }

        const video = await Video.create({
            title,
            url,
            videoId,
            thumbnailUrl,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            categoryId: categoryId || null,
            userId: req.user._id,
        });

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateVideo = async (req, res) => {
    try {
        const video = await Video.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json({ message: 'Video deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
