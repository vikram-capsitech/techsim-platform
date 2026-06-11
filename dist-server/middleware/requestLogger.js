"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodLogger = exports.devLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
// Development: colored, detailed
exports.devLogger = (0, morgan_1.default)('dev');
// Production: JSON structured logs (no sensitive data)
exports.prodLogger = (0, morgan_1.default)((tokens, req, res) => {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res) + 'ms',
        userId: req.user?._id || 'anonymous',
        // Never log: body, headers, tokens, keys
    });
});
