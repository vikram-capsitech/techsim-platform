"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Scenario_1 = __importDefault(require("../models/Scenario"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all scenario endpoints
router.use(auth_1.authMiddleware);
// GET /api/scenarios — list all, filter by ?module= and ?difficulty=
router.get('/', async (req, res, next) => {
    try {
        const { module, difficulty } = req.query;
        const filter = {};
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
        const scenarios = await Scenario_1.default.find(filter).sort({ title: 1 });
        return res.status(200).json(scenarios);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/scenarios/:id — single scenario
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        if (typeof id !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid scenario ID format' });
        }
        const scenario = await Scenario_1.default.findById(id);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        return res.status(200).json(scenario);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
