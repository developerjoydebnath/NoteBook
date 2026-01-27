import WebsiteLink from '../models/WebsiteLink.js';

export const getLinks = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        const query = { userId: req.user._id };

        if (category) query.categoryId = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const links = await WebsiteLink.find(query)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await WebsiteLink.countDocuments(query);

        res.json({
            links,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLinkById = async (req, res) => {
    try {
        const link = await WebsiteLink.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('categoryId', 'name');
        if (!link) return res.status(404).json({ message: 'Link not found' });
        res.json(link);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLink = async (req, res) => {
    try {
        const { name, url, categoryId, description } = req.body;
        const link = await WebsiteLink.create({
            name,
            url,
            categoryId: categoryId || null,
            description,
            userId: req.user._id,
        });
        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLink = async (req, res) => {
    try {
        const link = await WebsiteLink.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!link) return res.status(404).json({ message: 'Link not found' });
        res.json(link);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLink = async (req, res) => {
    try {
        const link = await WebsiteLink.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!link) return res.status(404).json({ message: 'Link not found' });
        res.json({ message: 'Link deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
