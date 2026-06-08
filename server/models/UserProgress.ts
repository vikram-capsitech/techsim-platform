import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioId: mongoose.Types.ObjectId;
  completedAt: Date;
  score: number;
  attempts: number;
  timeSpent: number;
}

const UserProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  completedAt: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  attempts: { type: Number, default: 1 },
  timeSpent: { type: Number, required: true }
});

// Compound unique index on userId + scenarioId
UserProgressSchema.index({ userId: 1, scenarioId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
