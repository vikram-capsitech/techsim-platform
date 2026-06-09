import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const FeedbackSchema = new mongoose.Schema({
  type: { type: String, enum: ['bug', 'feature', 'improvement', 'other'] },
  title: String,
  description: String,
  email: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  page: String,
  userAgent: String,
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

// Avoid recompiling model on hot reloads
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

// POST /api/feedback — public route, no auth required
router.post('/', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.json({ success: true, message: 'Feedback received. Thank you!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET /api/feedback — admin only (add simple admin check)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  // Simple admin check: check if user is authenticated and is an admin
  if (!req.user || (!req.user.email.endsWith('@techsim.com') && req.user.username !== 'admin' && req.user.email !== 'admin@techsim.com')) {
    return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
  }

  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

export default router;
