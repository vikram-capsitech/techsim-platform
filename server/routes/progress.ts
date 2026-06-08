import { Router, Response, NextFunction } from 'express';
import UserProgress from '../models/UserProgress';
import Scenario from '../models/Scenario';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authMiddleware to all progress endpoints
router.use(authMiddleware);

// POST /api/progress — save or update user progress
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { scenarioId, score, timeSpent } = req.body;

    if (!scenarioId || score === undefined || timeSpent === undefined) {
      return res.status(400).json({ error: 'scenarioId, score, and timeSpent are required' });
    }

    // Verify scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Find existing progress for this user + scenario
    let progress = await UserProgress.findOne({
      userId: req.user.userId,
      scenarioId
    });

    if (progress) {
      // Update existing progress record
      progress.attempts = (progress.attempts || 0) + 1;
      progress.score = Math.max(progress.score, score);
      progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
      progress.completedAt = new Date();
      await progress.save();
    } else {
      // Create new progress record
      progress = new UserProgress({
        userId: req.user.userId,
        scenarioId,
        score,
        attempts: 1,
        timeSpent,
        completedAt: new Date()
      });
      await progress.save();

      // Increment global completions for this scenario
      scenario.completionCount = (scenario.completionCount || 0) + 1;
      await scenario.save();
    }

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/progress — get all progress for logged-in user
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve progress list populated with scenario details
    const progressList = await UserProgress.find({ userId: req.user.userId })
      .populate('scenarioId')
      .sort({ completedAt: -1 });

    return res.status(200).json(progressList);
  } catch (error) {
    next(error);
  }
});

export default router;
