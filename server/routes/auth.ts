import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register — create user, hash password, return JWT
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, avatarUrl, plan } = req.body;

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username, email, and password must be strings' });
    }

    if (!username.trim() || !email.trim() || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
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

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username, plan: user.plan },
      secret,
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login — verify password, return JWT
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be strings' });
    }

    if (!email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured on the server');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username, plan: user.plan },
      secret,
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile — update profile (username and email)
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, email } = req.body;

    if (typeof username !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: 'Username and email must be strings' });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail) {
      return res.status(400).json({ error: 'Username and email cannot be empty' });
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    // Check if new username or email is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: req.user.userId },
      $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = trimmedUsername;
    user.email = trimmedEmail;
    await user.save();

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — return current user from JWT
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
