const mongoose = require('mongoose');

const JobInterviewSchema = new mongoose.Schema({
  round: { type: String, required: true }, // e.g., Technical, HR, Phone Screen
  date: { type: Date, required: true },
  location: { type: String, default: '' }, // e.g., Zoom, Onsite
  notes: { type: String, default: '' },
});

const JobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interviewing', 'offered', 'rejected'],
    default: 'saved',
  },
  dateApplied: {
    type: Date,
    default: Date.now,
  },
  salary: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  interviews: [JobInterviewSchema],
}, {
  timestamps: true,
});

const mongooseModel = mongoose.model('Job', JobSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(mongooseModel, 'jobs');
