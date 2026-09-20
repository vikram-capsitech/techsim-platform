"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const Scenario_1 = __importDefault(require("../models/Scenario"));
const KnowledgeCard_1 = __importDefault(require("../models/KnowledgeCard"));
const ToolRegistry_1 = require("../models/ToolRegistry");
const presetScenarios_json_1 = __importDefault(require("../../src/data/content/presetScenarios.json"));
const knowledgeCards_json_1 = __importDefault(require("../../src/data/content/knowledgeCards.json"));
const techsim_merged_registry_json_1 = __importDefault(require("../../src/data/registry/techsim_merged_registry.json"));
const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;
let mongoServer = null;
async function connectToDatabase() {
    if (isConnected) {
        return;
    }
    let connectionString = MONGODB_URI;
    if (!connectionString) {
        console.log('⚠️ MONGODB_URI not found in environment variables. Attempting to start in-memory MongoDB database...');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const path = await import('path');
            const fs = await import('fs');
            const dbPath = path.resolve(process.cwd(), '.mongo-data');
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }
            mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbPath: dbPath,
                    storageEngine: 'wiredTiger',
                },
            });
            connectionString = mongoServer.getUri();
            console.log(`✨ In-memory MongoDB server started successfully at ${connectionString}`);
            console.log(`💾 Persistent data stored in ${dbPath}`);
        }
        catch (err) {
            console.error('❌ Failed to spin up in-memory MongoDB:', err.message);
            console.error('Please configure a valid MONGODB_URI in your .env file.');
            process.exit(1);
        }
    }
    try {
        const db = await mongoose_1.default.connect(connectionString);
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB connected successfully');
        // Seed the database if it is running in-memory and empty
        if (!MONGODB_URI) {
            await seedDatabaseIfEmpty();
        }
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
async function seedDatabaseIfEmpty() {
    try {
        const scenarioCount = await Scenario_1.default.countDocuments();
        const cardCount = await KnowledgeCard_1.default.countDocuments();
        const registryCount = await ToolRegistry_1.NodeRegistry.countDocuments();
        if (scenarioCount === 0 || cardCount === 0 || registryCount === 0) {
            console.log('🔌 Database is empty. Seeding initial data...');
            // Seed scenarios
            if (scenarioCount === 0) {
                console.log(`Seeding ${presetScenarios_json_1.default.scenarios.length} scenarios...`);
                for (const scenario of presetScenarios_json_1.default.scenarios) {
                    await Scenario_1.default.findOneAndUpdate({ title: scenario.title }, {
                        title: scenario.title,
                        description: scenario.commonInterviewQuestion,
                        module: 'system_design',
                        difficulty: scenario.difficulty.toLowerCase(),
                        tags: [scenario.domain.toLowerCase()],
                        metadata: scenario
                    }, { upsert: true, new: true });
                }
            }
            // Seed knowledge cards
            if (cardCount === 0) {
                console.log(`Seeding ${knowledgeCards_json_1.default.components.length} knowledge cards...`);
                for (const card of knowledgeCards_json_1.default.components) {
                    await KnowledgeCard_1.default.findOneAndUpdate({ componentId: card.componentId }, card, { upsert: true, new: true });
                }
            }
            // Seed registry
            if (registryCount === 0) {
                const registry = techsim_merged_registry_json_1.default.nodeToolRegistry;
                console.log(`Seeding ${Object.keys(registry).length} registry nodes...`);
                for (const [nodeId, nodeData] of Object.entries(registry)) {
                    const flatTools = nodeData.toolGroups?.flatMap((g) => (g.tools || []).map((t) => ({
                        ...t,
                        groupId: g.groupId,
                        groupName: g.groupName
                    }))) || [];
                    await ToolRegistry_1.NodeRegistry.findOneAndUpdate({ nodeId }, {
                        nodeId,
                        nodeName: nodeData.nodeName,
                        category: nodeData.category,
                        subcategory: nodeData.subcategory,
                        description: nodeData.description,
                        isClientOrigin: nodeData.isClientOrigin || false,
                        validChaos: nodeData.validChaos || [],
                        invalidChaos: nodeData.invalidChaos || {},
                        validConnections: nodeData.validConnections || {},
                        commonMistakes: nodeData.commonMistakes || [],
                        realWorldUsage: nodeData.realWorldUsage || [],
                        tools: flatTools,
                        clientTypes: nodeData.clientTypes || []
                    }, { upsert: true, new: true });
                }
            }
            console.log('✅ In-memory database auto-seeded successfully!');
        }
    }
    catch (err) {
        console.error('⚠️ Failed to auto-seed in-memory database:', err);
    }
}
