import mongoose, { Schema, Document } from 'mongoose';

export interface IUserBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  earnedAt: Date;
}

const UserBadgeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now }
});

// Compound unique index on userId + badgeId to ensure a user only earns a badge once
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
