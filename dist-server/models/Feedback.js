"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const feedbackSchema = new mongoose_1.default.Schema({
    type: { type: String, enum: ['bug', 'feature', 'improvement', 'other'], required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    email: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    page: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.models.Feedback || mongoose_1.default.model('Feedback', feedbackSchema);
