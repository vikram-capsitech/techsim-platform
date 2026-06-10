import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagramVersion {
  canvasJson: { nodes: any[]; edges: any[] };
  savedAt: Date;
  label: string;
  nodeCount?: number;
  edgeCount?: number;
}

export interface IDiagram extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  module: 'system_design' | 'security' | 'k8s' | 'db_schema' | 'network' | 'devops';
  canvasJson: {
    nodes: any[];
    edges: any[];
  };
  thumbnailUrl?: string;
  isPublic: boolean;
  forkCount: number;
  tags: string[];
  versions: IDiagramVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema = new Schema({
  canvasJson: {
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
  },
  savedAt: { type: Date, default: Date.now },
  label:   { type: String, default: '' },
  nodeCount: { type: Number },
  edgeCount: { type: Number }
}, { _id: false });

const DiagramSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    module: {
      type: String,
      enum: ['system_design', 'security', 'k8s', 'db_schema', 'network', 'devops'],
      required: true
    },
    canvasJson: {
      nodes: { type: [Schema.Types.Mixed], default: [] },
      edges: { type: [Schema.Types.Mixed], default: [] }
    },
    thumbnailUrl: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    forkCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    versions: { type: [VersionSchema], default: [] },
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDiagram>('Diagram', DiagramSchema);
