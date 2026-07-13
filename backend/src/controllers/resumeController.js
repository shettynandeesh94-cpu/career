const Resume = require('../models/Resume');

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user.id,
    };

    const resume = await Resume.create(resumeData);

    res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Create Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating resume' });
  }
};

// @desc    Get all resumes of user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error('Get Resumes Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving resumes' });
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Get Resume By ID Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving resume details' });
  }
};

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
    }

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Update Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating resume' });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting resume' });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
};
