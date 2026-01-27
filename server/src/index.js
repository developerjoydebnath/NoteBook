import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Log origin for debugging
        if (process.env.NODE_ENV === 'development' || !origin) {
            console.log('Request from origin:', origin || 'No Origin (Mobile/Server-side)');
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // List of allowed mobile-specific origins just in case
        const mobileOrigins = ['capacitor://localhost', 'http://localhost', 'exp://'];

        if (
            allowedOrigins.includes(origin) ||
            mobileOrigins.some(mo => origin.startsWith(mo)) ||
            process.env.NODE_ENV === 'development'
        ) {
            callback(null, true);
        } else {
            console.error('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// MongoDB Connection
// Set global options for better error handling in serverless
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 5000);

let cachedDB = null;

// MongoDB Connection
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is missing from environment variables');
        }

        console.log('Attempting MongoDB connection...');

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000, // 8 seconds
            connectTimeoutMS: 8000,
            dbName: 'notes'
        });

        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        throw err;
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    // Health check doesn't need DB
    if (req.path === '/api/health') return next();

    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({
            error: 'Database Connection Failed',
            message: error.message,
            uri_check: process.env.MONGODB_URI ? 'URI exists' : 'URI MISSING',
            tip: 'If URI exists and 0.0.0.0/0 is added, double check your Atlas password and database name.'
        });
    }
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: process.env.NODE_ENV
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Keep-Notes API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
