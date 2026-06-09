import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectToDatabase } from './lib/mongodb';
import Diagram from './models/Diagram';

async function run() {
  await connectToDatabase();
  console.log('Connected to DB. Fetching all diagrams...');
  const diagrams = await Diagram.find({});
  console.log('Found diagrams:', JSON.stringify(diagrams, null, 2));
  await mongoose.connection.close();
  process.exit(0);
}

run();
