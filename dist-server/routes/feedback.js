"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Feedback_1 = __importDefault(require("../models/Feedback"));
const router = (0, express_1.Router)();
// POST /api/feedback — public route, no auth required
router.post('/', async (req, res) => {
    try {
        const feedback = new Feedback_1.default(req.body);
        await feedback.save();
        res.json({ success: true, message: 'Feedback received. Thank you!' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});
// GET /api/feedback — admin only (add simple admin check)
router.get('/', auth_1.authMiddleware, async (req, res) => {
    // Simple admin check: check if user is authenticated and is an admin
    if (!req.user || (!req.user.email.endsWith('@techsim.com') && req.user.username !== 'admin' && req.user.email !== 'admin@techsim.com')) {
        return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    try {
        const feedbacks = await Feedback_1.default.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
});
exports.default = router;
