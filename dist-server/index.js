"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("./lib/mongodb");
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const diagrams_1 = __importDefault(require("./routes/diagrams"));
const scenarios_1 = __importDefault(require("./routes/scenarios"));
const progress_1 = __importDefault(require("./routes/progress"));
const ai_1 = __importDefault(require("./routes/ai"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const knowledge_1 = __importDefault(require("./routes/knowledge"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS options preflight for all routes and apply CORS settings
app.options(/(.*)/, (0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Groq-API-Key', 'X-Gemini-API-Key'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Body parser
app.use(express_1.default.json());
// Mount routes under /api
app.use('/api/auth', auth_1.default);
app.use('/api/diagrams', diagrams_1.default);
app.use('/api/scenarios', scenarios_1.default);
app.use('/api/progress', progress_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/knowledge', knowledge_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'TechSim API is healthy' });
});
// Global error handler (should be mounted last)
app.use(errorHandler_1.errorHandler);
// Connect to MongoDB and start Express server
const start = async () => {
    try {
        await (0, mongodb_1.connectToDatabase)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
