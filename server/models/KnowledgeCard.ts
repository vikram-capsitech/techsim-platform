import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeCard extends Document {
  componentId: string;
  name: string;
  category: string;
  tagline: string;
  whatItDoes: string;
  whenToUse: string[];
  whenNotToUse: string[];
  realWorldUsage: { company: string; useCase: string }[];
  keyMetrics: { throughput: string; latency: string; typicalCost: string };
  commonMistakes: string[];
  interviewTips: string;
}

const KnowledgeCardSchema: Schema = new Schema({
  componentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  tagline: { type: String, default: '' },
  whatItDoes: { type: String, default: '' },
  whenToUse: { type: [String], default: [] },
  whenNotToUse: { type: [String], default: [] },
  realWorldUsage: [
    {
      company: { type: String, default: '' },
      useCase: { type: String, default: '' }
    }
  ],
  keyMetrics: {
    throughput: { type: String, default: '' },
    latency: { type: String, default: '' },
    typicalCost: { type: String, default: '' }
  },
  commonMistakes: { type: [String], default: [] },
  interviewTips: { type: String, default: '' }
});

export default mongoose.model<IKnowledgeCard>('KnowledgeCard', KnowledgeCardSchema);
