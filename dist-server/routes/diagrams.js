"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Diagram_1 = __importDefault(require("../models/Diagram"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authMiddleware to all diagram endpoints
router.use(auth_1.authMiddleware);
// GET /api/diagrams — get logged-in user's diagrams
router.get('/', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const diagrams = await Diagram_1.default.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
        return res.status(200).json(diagrams);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/diagrams/my route — Returns all diagrams for the logged-in user, sorted by updatedAt desc
router.get('/my', auth_1.authMiddleware, async (req, res) => {
    const diagrams = await Diagram_1.default.find({ userId: req.user._id })
        .sort({ updatedAt: -1 })
        .select('_id title module thumbnailUrl updatedAt forkCount isPublic')
        .limit(50);
    res.json(diagrams);
});
// POST /api/diagrams — create diagram, userId from JWT
router.post('/', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { title, module, canvasJson, thumbnailUrl, isPublic, tags } = req.body;
        if (!title || !module) {
            return res.status(400).json({ error: 'Title and module are required' });
        }
        const diagram = new Diagram_1.default({
            userId: req.user.userId,
            title,
            module,
            canvasJson: canvasJson || { nodes: [], edges: [] },
            thumbnailUrl: thumbnailUrl || '',
            isPublic: !!isPublic,
            tags: tags || []
        });
        await diagram.save();
        return res.status(201).json(diagram);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/diagrams/:id — get single (owner or isPublic)
router.get('/:id', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const diagram = await Diagram_1.default.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        // Owner check or public check
        if (diagram.userId.toString() !== req.user.userId && !diagram.isPublic) {
            return res.status(403).json({ error: 'Access denied. This diagram is private.' });
        }
        return res.status(200).json(diagram);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/diagrams/:id — update (owner only)
router.put('/:id', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const diagram = await Diagram_1.default.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        // Check ownership
        if (diagram.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden. Only the owner can modify this diagram.' });
        }
        const { title, module, canvasJson, thumbnailUrl, isPublic, tags } = req.body;
        if (title !== undefined)
            diagram.title = title;
        if (module !== undefined)
            diagram.module = module;
        if (canvasJson !== undefined)
            diagram.canvasJson = canvasJson;
        if (thumbnailUrl !== undefined)
            diagram.thumbnailUrl = thumbnailUrl;
        if (isPublic !== undefined)
            diagram.isPublic = isPublic;
        if (tags !== undefined)
            diagram.tags = tags;
        await diagram.save();
        return res.status(200).json(diagram);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/diagrams/:id — delete (owner only)
router.delete('/:id', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const diagram = await Diagram_1.default.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        // Check ownership
        if (diagram.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden. Only the owner can delete this diagram.' });
        }
        await diagram.deleteOne();
        return res.status(200).json({ message: 'Diagram deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/diagrams/:id/fork — duplicate, increment forkCount
router.post('/:id/fork', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const original = await Diagram_1.default.findById(req.params.id);
        if (!original) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        // Must be owner or public to fork
        if (original.userId.toString() !== req.user.userId && !original.isPublic) {
            return res.status(403).json({ error: 'Forbidden. Cannot fork private diagrams.' });
        }
        // Increment forkCount
        original.forkCount = (original.forkCount || 0) + 1;
        await original.save();
        // Create duplicate diagram owned by the current user
        const fork = new Diagram_1.default({
            userId: req.user.userId,
            title: `Fork of ${original.title}`,
            module: original.module,
            canvasJson: original.canvasJson,
            thumbnailUrl: original.thumbnailUrl,
            isPublic: false, // fork is private by default
            forkCount: 0,
            tags: original.tags
        });
        await fork.save();
        return res.status(201).json(fork);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/diagrams/:id/autosave
// Rate limited: max 1 save per 10 seconds per user
const lastSave = new Map();
router.put('/:id/autosave', auth_1.authMiddleware, async (req, res) => {
    const userId = req.user._id.toString();
    const now = Date.now();
    const last = lastSave.get(userId) || 0;
    if (now - last < 10000) {
        return res.json({ success: true, skipped: true, message: 'Rate limited — too soon' });
    }
    lastSave.set(userId, now);
    const diagram = await Diagram_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { canvasJson: req.body.canvasJson, updatedAt: new Date() }, { new: true });
    if (!diagram)
        return res.status(404).json({ error: 'Diagram not found' });
    res.json({ success: true, savedAt: new Date() });
});
exports.default = router;
