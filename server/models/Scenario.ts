import mongoose, { Schema, Document } from 'mongoose';

export interface IScenario extends Document {
  title: string;
  description: string;
  module: 'system_design' | 'security' | 'k8s' | 'db_schema' | 'network' | 'devops';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  canvasJson: {
    nodes: any[];
    edges: any[];
  };
  solutionJson: any;
  tags: string[];
  completionCount: number;
}

const ScenarioSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  module: {
    type: String,
    enum: ['system_design', 'security', 'k8s', 'db_schema', 'network', 'devops'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  canvasJson: {
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] }
  },
  solutionJson: { type: Schema.Types.Mixed, default: {} },
  tags: { type: [String], default: [] },
  completionCount: { type: Number, default: 0 }
});

export default mongoose.model<IScenario>('Scenario', ScenarioSchema);
