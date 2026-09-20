import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Scenario from '../models/Scenario';
import KnowledgeCard from '../models/KnowledgeCard';
import { NodeRegistry } from '../models/ToolRegistry';

import scenarioData from '../../src/data/content/presetScenarios.json';
import knowledgeData from '../../src/data/content/knowledgeCards.json';
import registryData from '../../src/data/registry/techsim_merged_registry.json';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let mongoServer: any = null;

export async function connectToDatabase() {
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
    } catch (err: any) {
      console.error('❌ Failed to spin up in-memory MongoDB:', err.message);
      console.error('Please configure a valid MONGODB_URI in your .env file.');
      process.exit(1);
    }
  }

  try {
    const db = await mongoose.connect(connectionString!);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    
    // Seed the database if it is running in-memory and empty
    if (!MONGODB_URI) {
      await seedDatabaseIfEmpty();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDatabaseIfEmpty() {
  try {
    const scenarioCount = await Scenario.countDocuments();
    const cardCount = await KnowledgeCard.countDocuments();
    const registryCount = await NodeRegistry.countDocuments();

    if (scenarioCount === 0 || cardCount === 0 || registryCount === 0) {
      console.log('🔌 Database is empty. Seeding initial data...');
      
      // Seed scenarios
      if (scenarioCount === 0) {
        console.log(`Seeding ${scenarioData.scenarios.length} scenarios...`);
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
      }

      // Seed knowledge cards
      if (cardCount === 0) {
        console.log(`Seeding ${knowledgeData.components.length} knowledge cards...`);
        for (const card of knowledgeData.components) {
          await KnowledgeCard.findOneAndUpdate(
            { componentId: card.componentId },
            card,
            { upsert: true, new: true }
          );
        }
      }

      // Seed registry
      if (registryCount === 0) {
        const registry = registryData.nodeToolRegistry as any;
        console.log(`Seeding ${Object.keys(registry).length} registry nodes...`);
        for (const [nodeId, nodeData] of Object.entries(registry) as [string, any][]) {
          const flatTools = nodeData.toolGroups?.flatMap((g: any) =>
            (g.tools || []).map((t: any) => ({
              ...t,
              groupId: g.groupId,
              groupName: g.groupName
            }))
          ) || [];

          await NodeRegistry.findOneAndUpdate(
            { nodeId },
            {
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
            },
            { upsert: true, new: true }
          );
        }
      }
      console.log('✅ In-memory database auto-seeded successfully!');
    }
  } catch (err) {
    console.error('⚠️ Failed to auto-seed in-memory database:', err);
  }
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
  isConnected = false;
}

const handleShutdown = async () => {
  try {
    await disconnectFromDatabase();
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
  process.exit(0);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.once('SIGUSR2', async () => {
  try {
    await disconnectFromDatabase();
  } catch (err) {
    console.error('Error closing database connection on reload:', err);
  }
  process.kill(process.pid, 'SIGUSR2');
});

