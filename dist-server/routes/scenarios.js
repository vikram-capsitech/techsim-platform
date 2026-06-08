"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Scenario_1 = __importDefault(require("../models/Scenario"));
const router = (0, express_1.Router)();
// GET /api/scenarios — list all, filter by ?module= and ?difficulty=
router.get('/', async (req, res, next) => {
    try {
        const { module, difficulty } = req.query;
        const filter = {};
        if (module) {
            filter.module = module;
        }
        if (difficulty) {
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
        const scenario = await Scenario_1.default.findById(req.params.id);
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
