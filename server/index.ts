import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDatabase } from './lib/mongodb';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { devLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import diagramRoutes from './routes/diagrams';
import scenarioRoutes from './routes/scenarios';
import progressRoutes from './routes/progress';
import aiRoutes from './routes/ai';
import feedbackRoutes from './routes/feedback';
import knowledgeRoutes from './routes/knowledge';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (add EARLY)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for now — Canvas needs inline scripts
  crossOriginEmbedderPolicy: false
}));

// Request logging
app.use(devLogger);

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Groq-API-Key', 'X-Gemini-API-Key'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// Apply rate limiting (API routes, specific auth routes, AI routes)
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai/', aiLimiter);

// Body parser
app.use(express.json());

// Sanitize all inputs (requires body parser to have run first)
app.use(sanitizeInput);

// Mount routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/knowledge', knowledgeRoutes);

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
