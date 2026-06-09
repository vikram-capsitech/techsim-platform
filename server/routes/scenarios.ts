import { Router, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Scenario from '../models/Scenario';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all scenario endpoints
router.use(authMiddleware);

// GET /api/scenarios — list all, filter by ?module= and ?difficulty=
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { module, difficulty } = req.query;
    const filter: any = {};

    if (module) {
      if (typeof module !== 'string') {
        return res.status(400).json({ error: 'Invalid module parameter' });
      }
      filter.module = module;
    }
    if (difficulty) {
      if (typeof difficulty !== 'string') {
        return res.status(400).json({ error: 'Invalid difficulty parameter' });
      }
      filter.difficulty = difficulty;
    }

    const scenarios = await Scenario.find(filter).sort({ title: 1 });
    return res.status(200).json(scenarios);
  } catch (error) {
    next(error);
  }
});

// GET /api/scenarios/:id — single scenario
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid scenario ID format' });
    }

    const scenario = await Scenario.findById(id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    return res.status(200).json(scenario);
  } catch (error) {
    next(error);
  }
});

export default router;
