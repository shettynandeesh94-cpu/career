const Job = require('../models/Job');

// @desc    Create a new job application entry
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      user: req.user.id,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating job application' });
  }
};

// @desc    Get all job entries of user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get Jobs Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving job applications' });
  }
};

// @desc    Get single job entry details
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job entry not found' });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Get Job By ID Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving job details' });
  }
};

// @desc    Update a job entry
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
  try {
    let job = await Job.findOne({ _id: req.params.id, user: req.user.id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job entry not found or unauthorized' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Update Job Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating job details' });
  }
};

// @desc    Delete a job entry
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job entry not found or unauthorized' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete Job Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting job entry' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
