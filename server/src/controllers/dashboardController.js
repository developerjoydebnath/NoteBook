import Category from '../models/Category.js';
import Note from '../models/Note.js';
import Video from '../models/Video.js';
import WebsiteLink from '../models/WebsiteLink.js';

export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalNotes = await Note.countDocuments({ userId });
        const totalLinks = await WebsiteLink.countDocuments({ userId });
        const totalVideos = await Video.countDocuments({ userId });

        const categoryStats = await Category.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'notes',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'notes'
                }
            },
            {
                $lookup: {
                    from: 'websitelinks',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'links'
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'videos'
                }
            },
            {
                $project: {
                    name: 1,
                    type: 1,
                    count: { $add: [{ $size: '$notes' }, { $size: '$links' }, { $size: '$videos' }] }
                }
            }
        ]);

        // Daily activity for the last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const activityData = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const notesCount = await Note.countDocuments({
                userId,
                createdAt: { $gte: date, $lt: nextDay }
            });

            const linksCount = await WebsiteLink.countDocuments({
                userId,
                createdAt: { $gte: date, $lt: nextDay }
            });

            const videosCount = await Video.countDocuments({
                userId,
                createdAt: { $gte: date, $lt: nextDay }
            });

            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                notes: notesCount,
                links: linksCount,
                videos: videosCount,
            };
        }));

        res.json({
            totalNotes,
            totalLinks,
            totalVideos,
            categoryStats,
            activityData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
