import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/mongodb';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import diagramRoutes from './routes/diagrams';
import scenarioRoutes from './routes/scenarios';
import progressRoutes from './routes/progress';
import aiRoutes from './routes/ai';
import feedbackRoutes from './routes/feedback';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS options preflight for all routes and apply CORS settings
app.options(/(.*)/, cors());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parser
app.use(express.json());

// Mount routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'TechSim API is healthy' });
});

// Global error handler (should be mounted last)
app.use(errorHandler);

// Connect to MongoDB and start Express server
const start = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
