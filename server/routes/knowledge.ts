import { Router, Request, Response, NextFunction } from 'express';
import KnowledgeCard from '../models/KnowledgeCard';

const router = Router();

// GET /api/knowledge/:componentId — get knowledge card for a component
router.get('/:componentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await KnowledgeCard.findOne({
      componentId: req.params.componentId
    });
    if (!card) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(card);
  } catch (error) {
    next(error);
  }
});

export default router;
