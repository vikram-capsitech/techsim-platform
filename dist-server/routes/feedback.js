"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const FeedbackSchema = new mongoose_1.default.Schema({
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
const Feedback = mongoose_1.default.models.Feedback || mongoose_1.default.model('Feedback', FeedbackSchema);
// POST /api/feedback — public route, no auth required
router.post('/', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
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
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
});
exports.default = router;
