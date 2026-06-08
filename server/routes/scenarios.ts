import { Router, Request, Response, NextFunction } from 'express';
import Scenario from '../models/Scenario';

const router = Router();

// GET /api/scenarios — list all, filter by ?module= and ?difficulty=
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { module, difficulty } = req.query;
    const filter: any = {};

    if (module) {
      filter.module = module;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const scenarios = await Scenario.find(filter).sort({ title: 1 });
    return res.status(200).json(scenarios);
  } catch (error) {
    next(error);
  }
});

// GET /api/scenarios/:id — single scenario
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    return res.status(200).json(scenario);
  } catch (error) {
    next(error);
  }
});

export default router;
