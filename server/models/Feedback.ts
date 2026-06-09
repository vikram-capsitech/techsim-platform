import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type:        { type: String, enum: ['bug', 'feature', 'improvement', 'other'], required: true },
  title:       { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  email:       { type: String },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  page:        { type: String },
  userAgent:   { type: String },
  timestamp:   { type: Date },
  createdAt:   { type: Date, default: Date.now },
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
