import Category from '../models/Category.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import WebsiteLink from '../models/WebsiteLink.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        const usersWithStats = await Promise.all(users.map(async (user) => {
            const notesCount = await Note.countDocuments({ userId: user._id });
            const linksCount = await WebsiteLink.countDocuments({ userId: user._id });
            return {
                ...user._doc,
                notesCount,
                linksCount,
            };
        }));

        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Admin cannot delete themselves' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascade delete: Notes, Links, Categories
        await Note.deleteMany({ userId: id });
        await WebsiteLink.deleteMany({ userId: id });
        await Category.deleteMany({ userId: id });

        // Finally delete the user
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Prevent admin from changing their own role to avoid lockout
        if (id === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ message: 'Admin cannot demote themselves' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
