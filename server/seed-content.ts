import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectToDatabase } from './lib/mongodb';
import Scenario from './models/Scenario';
import KnowledgeCard from './models/KnowledgeCard';
import knowledgeData from '../src/data/content/knowledgeCards.json';
import scenarioData from '../src/data/content/presetScenarios.json';

async function seedContent() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    // Upsert knowledge cards
    console.log('Upserting knowledge cards...');
    for (const card of knowledgeData.components) {
      await KnowledgeCard.findOneAndUpdate(
        { componentId: card.componentId },
        card,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${knowledgeData.components.length} knowledge cards`);

    // Upsert preset scenarios into Scenario collection
    console.log('Upserting preset scenarios...');
    for (const scenario of scenarioData.scenarios) {
      await Scenario.findOneAndUpdate(
        { title: scenario.title },
        {
          title: scenario.title,
          description: scenario.commonInterviewQuestion,
          module: 'system_design',
          difficulty: scenario.difficulty.toLowerCase(),
          tags: [scenario.domain.toLowerCase()],
          metadata: scenario
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${scenarioData.scenarios.length} scenarios`);

    console.log('✅ Content seeding complete');
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content:', error);
    process.exit(1);
  }
}

seedContent();
