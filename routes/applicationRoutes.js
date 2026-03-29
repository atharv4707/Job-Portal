const express = require('express');
const router = express.Router();
const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');

// Check if user is logged in
// We use this before any route that needs authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Please login first' });
  }
};

// Apply for a job
// This is called when a job seeker clicks "Apply Now"
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Only job seekers can apply for jobs
    if (req.session.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }

    const { jobId, coverLetter } = req.body;

    // First, check if the job actually exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied to this job
    // We don't want duplicate applications
    const existingApplication = await Application.findOne({
      jobId,
      jobseekerId: req.session.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create new application
    const application = new Application({
      jobId,
      jobseekerId: req.session.user.id,
      coverLetter
    });

    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Get all applications by the current job seeker
// This shows in the job seeker's dashboard
router.get('/my-applications', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all applications and include the job details
    // populate() gets the full job information, not just the ID
    const applications = await Application.find({ jobseekerId: req.session.user.id })
      .populate('jobId')
      .sort({ appliedAt: -1 }); // Newest first

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get all applications for a specific job
// Employers use this to see who applied to their job
router.get('/job/:jobId', isAuthenticated, async (req, res) => {
  try {
    // Only employers can see applications
    if (req.session.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Make sure this job belongs to the employer
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.session.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get all applications for this job
    // Include the job seeker's information
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('jobseekerId')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Update application status
// Employers can mark applications as reviewed, shortlisted, or rejected
router.put('/:id/status', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    
    // Get the application and include job details
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Make sure the job belongs to this employer
    if (application.jobId.employerId.toString() !== req.session.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the status
    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
