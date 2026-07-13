const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['ai', 'user'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const InterviewFeedbackSchema = new mongoose.Schema({
  overallScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  correctnessScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  feedbackText: { type: String, default: '' },
  sampleImprovements: [{
    question: { type: String },
    userAnswer: { type: String },
    suggestedAnswer: { type: String },
    critique: { type: String },
  }],
});

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'Software Engineer',
  },
  mode: {
    type: String,
    enum: ['hr', 'technical'],
    default: 'technical',
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  messages: [MessageSchema],
  feedback: InterviewFeedbackSchema,
}, {
  timestamps: true,
});

const mongooseModel = mongoose.model('Interview', InterviewSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(mongooseModel, 'interviews');
