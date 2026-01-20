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
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB: notes'))
    .catch((err) => {
        console.error('MongoDB connection error details:');
        console.error('Code:', err.code);
        console.error('Reason:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.error('\nTIP: This often means your IP is not whitelisted in MongoDB Atlas or you have a DNS issue.');
            console.error('Log into MongoDB Atlas -> Network Access -> Add Current IP Address.');
        }
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/links', linkRoutes);
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
