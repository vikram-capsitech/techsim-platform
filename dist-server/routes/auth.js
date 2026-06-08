"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/register — create user, hash password, return JWT
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, avatarUrl, plan } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already in use' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = new User_1.default({
            username,
            email,
            password: hashedPassword,
            avatarUrl: avatarUrl || '',
            plan: plan || 'free'
        });
        await user.save();
        // Generate JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured on the server');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, username: user.username, plan: user.plan }, secret, { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                plan: user.plan,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/login — verify password, return JWT
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const user = await User_1.default.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Verify password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured on the server');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, username: user.username, plan: user.plan }, secret, { expiresIn: '7d' });
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                plan: user.plan,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/auth/me — return current user from JWT
router.get('/me', auth_1.authMiddleware, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await User_1.default.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
