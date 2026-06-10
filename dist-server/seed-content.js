"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("./lib/mongodb");
const Scenario_1 = __importDefault(require("./models/Scenario"));
const KnowledgeCard_1 = __importDefault(require("./models/KnowledgeCard"));
const knowledgeCards_json_1 = __importDefault(require("../src/data/content/knowledgeCards.json"));
const presetScenarios_json_1 = __importDefault(require("../src/data/content/presetScenarios.json"));
async function seedContent() {
    try {
        console.log('Connecting to database...');
        await (0, mongodb_1.connectToDatabase)();
        // Upsert knowledge cards
        console.log('Upserting knowledge cards...');
        for (const card of knowledgeCards_json_1.default.components) {
            await KnowledgeCard_1.default.findOneAndUpdate({ componentId: card.componentId }, card, { upsert: true, new: true });
        }
        console.log(`✅ Seeded ${knowledgeCards_json_1.default.components.length} knowledge cards`);
        // Upsert preset scenarios into Scenario collection
        console.log('Upserting preset scenarios...');
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
        console.log(`✅ Seeded ${presetScenarios_json_1.default.scenarios.length} scenarios`);
        console.log('✅ Content seeding complete');
        await mongoose_1.default.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding content:', error);
        process.exit(1);
    }
}
seedContent();
