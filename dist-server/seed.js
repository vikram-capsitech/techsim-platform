"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const Scenario_1 = __importDefault(require("./models/Scenario"));
const mongodb_1 = require("./lib/mongodb");
const starterScenarios = [
    {
        title: 'Netflix Architecture',
        description: 'Design a video streaming platform serving 200M users globally with 99.99% uptime',
        module: 'system_design',
        difficulty: 'advanced',
        tags: ['streaming', 'cdn', 'microservices'],
        completionCount: 0,
        canvasJson: { nodes: [], edges: [] },
        solutionJson: { nodes: [], edges: [] }
    },
    {
        title: 'WhatsApp Messaging System',
        description: 'Build a real-time messaging system handling 100B messages per day',
        module: 'system_design',
        difficulty: 'intermediate',
        tags: ['websockets', 'queues', 'encryption'],
        completionCount: 0,
        canvasJson: { nodes: [], edges: [] },
        solutionJson: { nodes: [], edges: [] }
    },
    {
        title: 'DDoS Attack & Defense',
        description: 'Launch a DDoS attack against your system and learn to defend it with WAF and Rate Limiting',
        module: 'security',
        difficulty: 'beginner',
        tags: ['ddos', 'waf', 'ratelimit'],
        completionCount: 0,
        canvasJson: { nodes: [], edges: [] },
        solutionJson: { nodes: [], edges: [] }
    },
    {
        title: 'K8s Pod Failure Recovery',
        description: 'Simulate CrashLoopBackOff and configure liveness probes to auto-heal',
        module: 'k8s',
        difficulty: 'intermediate',
        tags: ['pods', 'crashloop', 'healing', 'probes'],
        completionCount: 0,
        canvasJson: { nodes: [], edges: [] },
        solutionJson: { nodes: [], edges: [] }
    },
    {
        title: 'Uber Ride Matching',
        description: 'Design the geolocation and ride matching system handling 20M daily rides',
        module: 'system_design',
        difficulty: 'advanced',
        tags: ['geolocation', 'matching', 'surge', 'websockets'],
        completionCount: 0,
        canvasJson: { nodes: [], edges: [] },
        solutionJson: { nodes: [], edges: [] }
    }
];
async function seed() {
    try {
        await (0, mongodb_1.connectToDatabase)();
        console.log('Seeding starter scenarios...');
        // Clear existing
        await Scenario_1.default.deleteMany({});
        // Insert new
        const created = await Scenario_1.default.insertMany(starterScenarios);
        console.log(`Successfully seeded ${created.length} starter scenarios.`);
        await mongoose_1.default.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
seed();
