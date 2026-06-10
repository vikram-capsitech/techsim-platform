import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: string;
  trackId: string;
  completed: boolean;
  completedAt: Date;
  score: number;
  timeSpent: number;
}

const LessonProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  trackId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }
});

// Compound unique index on userId + lessonId
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
