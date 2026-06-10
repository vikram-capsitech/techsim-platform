import { Router, Response, NextFunction } from 'express';
import UserProgress from '../models/UserProgress';
import Scenario from '../models/Scenario';
import LessonProgress from '../models/LessonProgress';
import UserBadge from '../models/UserBadge';
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

// POST /api/progress/lesson — upsert lesson completion
router.post('/lesson', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { lessonId, trackId, completed, score, timeSpent } = req.body;

    if (!lessonId || !trackId) {
      return res.status(400).json({ error: 'lessonId and trackId are required' });
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { userId: req.user.userId, lessonId },
      {
        $set: {
          trackId,
          completed: completed !== undefined ? completed : true,
          completedAt: new Date(),
          score: score !== undefined ? score : 0,
          timeSpent: timeSpent !== undefined ? timeSpent : 0
        }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/lessons — all lesson progress for user
router.get('/lessons', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progressList = await LessonProgress.find({ userId: req.user.userId });
    return res.status(200).json(progressList);
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/badges — user badges
router.get('/badges', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const badges = await UserBadge.find({ userId: req.user.userId }).sort({ earnedAt: -1 });
    return res.status(200).json(badges);
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/badge — award badge
router.post('/badge', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { badgeId } = req.body;
    if (!badgeId) {
      return res.status(400).json({ error: 'badgeId is required' });
    }

    const userBadge = await UserBadge.findOneAndUpdate(
      { userId: req.user.userId, badgeId },
      { $setOnInsert: { earnedAt: new Date() } },
      { new: true, upsert: true }
    );

    return res.status(200).json(userBadge);
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/interview — save interview result
router.post('/interview', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { challengeId, scenarioId, score, timeSpent } = req.body;
    const targetScenarioId = scenarioId || challengeId;

    if (!targetScenarioId || score === undefined || timeSpent === undefined) {
      return res.status(400).json({ error: 'scenarioId/challengeId, score, and timeSpent are required' });
    }

    const scenario = await Scenario.findById(targetScenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario/Challenge not found' });
    }

    let progress = await UserProgress.findOne({
      userId: req.user.userId,
      scenarioId: targetScenarioId
    });

    if (progress) {
      progress.attempts = (progress.attempts || 0) + 1;
      progress.score = Math.max(progress.score, score);
      progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
      progress.completedAt = new Date();
      await progress.save();
    } else {
      progress = new UserProgress({
        userId: req.user.userId,
        scenarioId: targetScenarioId,
        score,
        attempts: 1,
        timeSpent,
        completedAt: new Date()
      });
      await progress.save();

      scenario.completionCount = (scenario.completionCount || 0) + 1;
      await scenario.save();
    }

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/leaderboard/:challengeId
// Returns top 10 scores for a challenge
router.get('/leaderboard/:challengeId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const topScores = await UserProgress.find({
      scenarioId: req.params.challengeId
    })
    .sort({ score: -1 })
    .limit(10)
    .populate('userId', 'username avatarUrl');

    return res.status(200).json(topScores);
  } catch (error) {
    next(error);
  }
});

export default router;
