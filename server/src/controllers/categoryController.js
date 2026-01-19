import Category from '../models/Category.js';
import Note from '../models/Note.js';
import WebsiteLink from '../models/WebsiteLink.js';

export const getCategories = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { userId: req.user._id };
        if (type) query.type = type;

        const categories = await Category.find(query).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, type } = req.body;
        const category = await Category.create({ name, type, userId: req.user._id });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find the category first to check ownership and get its type
        const category = await Category.findOne({ _id: id, userId });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Nullify categoryId in associated documents based on type
        if (category.type === 'note') {
            await Note.updateMany({ categoryId: id, userId }, { $unset: { categoryId: "" } });
        } else if (category.type === 'website') {
            await WebsiteLink.updateMany({ categoryId: id, userId }, { $unset: { categoryId: "" } });
        }

        // Delete the category
        await Category.findByIdAndDelete(id);

        res.json({ message: 'Category deleted and associated items uncategorized' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
