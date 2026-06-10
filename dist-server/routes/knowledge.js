"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KnowledgeCard_1 = __importDefault(require("../models/KnowledgeCard"));
const router = (0, express_1.Router)();
// GET /api/knowledge/:componentId — get knowledge card for a component
router.get('/:componentId', async (req, res, next) => {
    try {
        const card = await KnowledgeCard_1.default.findOne({
            componentId: req.params.componentId
        });
        if (!card) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.json(card);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
