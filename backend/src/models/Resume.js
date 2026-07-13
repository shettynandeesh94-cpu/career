const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const EducationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  gpa: { type: String, default: '' },
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  technologies: { type: String, default: '' }, // comma separated or text
  link: { type: String, default: '' },
  description: { type: String, default: '' },
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, default: 'Intermediate' }, // Beginner, Intermediate, Expert
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String, default: '' },
  link: { type: String, default: '' },
});

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume',
  },
  personalInfo: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  summary: { type: String, default: '' },
  experience: [ExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  skills: [SkillSchema],
  certifications: [CertificationSchema],
  templateId: {
    type: String,
    default: 'minimal', // minimal, tech, modern
  },
}, {
  timestamps: true,
});

const mongooseModel = mongoose.model('Resume', ResumeSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(mongooseModel, 'resumes');
