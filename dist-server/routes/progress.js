"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const UserProgress_1 = __importDefault(require("../models/UserProgress"));
const Scenario_1 = __importDefault(require("../models/Scenario"));
const LessonProgress_1 = __importDefault(require("../models/LessonProgress"));
const UserBadge_1 = __importDefault(require("../models/UserBadge"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authMiddleware to all progress endpoints
router.use(auth_1.authMiddleware);
// POST /api/progress — save or update user progress
router.post('/', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { scenarioId, score, timeSpent } = req.body;
        if (!scenarioId || score === undefined || timeSpent === undefined) {
            return res.status(400).json({ error: 'scenarioId, score, and timeSpent are required' });
        }
        // Verify scenario exists
        const scenario = await Scenario_1.default.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        // Find existing progress for this user + scenario
        let progress = await UserProgress_1.default.findOne({
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
        }
        else {
            // Create new progress record
            progress = new UserProgress_1.default({
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress — get all progress for logged-in user
router.get('/', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Retrieve progress list populated with scenario details
        const progressList = await UserProgress_1.default.find({ userId: req.user.userId })
            .populate('scenarioId')
            .sort({ completedAt: -1 });
        return res.status(200).json(progressList);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/progress/lesson — upsert lesson completion
router.post('/lesson', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { lessonId, trackId, completed, score, timeSpent } = req.body;
        if (!lessonId || !trackId) {
            return res.status(400).json({ error: 'lessonId and trackId are required' });
        }
        const progress = await LessonProgress_1.default.findOneAndUpdate({ userId: req.user.userId, lessonId }, {
            $set: {
                trackId,
                completed: completed !== undefined ? completed : true,
                completedAt: new Date(),
                score: score !== undefined ? score : 0,
                timeSpent: timeSpent !== undefined ? timeSpent : 0
            }
        }, { new: true, upsert: true });
        return res.status(200).json(progress);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress/lessons — all lesson progress for user
router.get('/lessons', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const progressList = await LessonProgress_1.default.find({ userId: req.user.userId });
        return res.status(200).json(progressList);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress/badges — user badges
router.get('/badges', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const badges = await UserBadge_1.default.find({ userId: req.user.userId }).sort({ earnedAt: -1 });
        return res.status(200).json(badges);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/progress/badge — award badge
router.post('/badge', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { badgeId } = req.body;
        if (!badgeId) {
            return res.status(400).json({ error: 'badgeId is required' });
        }
        const userBadge = await UserBadge_1.default.findOneAndUpdate({ userId: req.user.userId, badgeId }, { $setOnInsert: { earnedAt: new Date() } }, { new: true, upsert: true });
        return res.status(200).json(userBadge);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/progress/interview — save interview result
router.post('/interview', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { challengeId, scenarioId, score, timeSpent } = req.body;
        const targetScenarioId = scenarioId || challengeId;
        if (!targetScenarioId || score === undefined || timeSpent === undefined) {
            return res.status(400).json({ error: 'scenarioId/challengeId, score, and timeSpent are required' });
        }
        const scenario = mongoose_1.default.Types.ObjectId.isValid(targetScenarioId)
            ? await Scenario_1.default.findById(targetScenarioId)
            : await Scenario_1.default.findOne({ $or: [{ 'metadata.id': targetScenarioId }, { title: targetScenarioId }] });
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario/Challenge not found' });
        }
        const resolvedScenarioId = scenario._id;
        let progress = await UserProgress_1.default.findOne({
            userId: req.user.userId,
            scenarioId: resolvedScenarioId
        });
        if (progress) {
            progress.attempts = (progress.attempts || 0) + 1;
            progress.score = Math.max(progress.score, score);
            progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
            progress.completedAt = new Date();
            await progress.save();
        }
        else {
            progress = new UserProgress_1.default({
                userId: req.user.userId,
                scenarioId: resolvedScenarioId,
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress/leaderboard/:challengeId
// Returns top 10 scores for a challenge
router.get('/leaderboard/:challengeId', async (req, res, next) => {
    try {
        const { challengeId } = req.params;
        if (typeof challengeId !== 'string') {
            return res.status(400).json({ error: 'Invalid challengeId' });
        }
        const scenario = mongoose_1.default.Types.ObjectId.isValid(challengeId)
            ? await Scenario_1.default.findById(challengeId)
            : await Scenario_1.default.findOne({ $or: [{ 'metadata.id': challengeId }, { title: challengeId }] });
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario/Challenge not found' });
        }
        const topScores = await UserProgress_1.default.find({
            scenarioId: scenario._id
        })
            .sort({ score: -1 })
            .limit(10)
            .populate('userId', 'username avatarUrl');
        return res.status(200).json(topScores);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
