const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');

// This function checks if someone is logged in before they can do certain things
// Like posting a job or viewing their dashboard
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next(); // User is logged in, let them continue
  } else {
    res.status(401).json({ message: 'Please login first' });
  }
};

// Get all jobs - this is what shows on the homepage and jobs page
// Users can also search by keyword, location, or job type
router.get('/', async (req, res) => {
  try {
    // Get search parameters from the URL
    const { search, location, jobType } = req.query;
    
    // Start with finding only active jobs
    let query = { status: 'active' };

    // If user searched for something, look in title, company name, and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // 'i' means case-insensitive
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location if provided
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by job type if selected
    if (jobType) {
      query.jobType = jobType;
    }

    // Get jobs from database, newest first
    const jobs = await Job.find(query).sort({ postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Get details of a single job
// This is called when someone clicks on a job card
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job details' });
  }
});

// Post a new job - only employers can do this
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Make sure the user is an employer
    if (req.session.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    // Add the employer's ID to the job data
    const jobData = {
      ...req.body,
      employerId: req.session.user.id
    };

    // Save the new job to database
    const job = new Job(jobData);
    await job.save();

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Failed to post job' });
  }
});

// Get all jobs posted by the current employer
// This shows in the employer's dashboard
router.get('/employer/my-jobs', isAuthenticated, async (req, res) => {
  try {
    // Only employers can see this
    if (req.session.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find all jobs posted by this employer
    const jobs = await Job.find({ employerId: req.session.user.id }).sort({ postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs' });
  }
});

// Update a job posting
// Employer can edit their job details
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // Find the job and make sure it belongs to this employer
    const job = await Job.findOne({ _id: req.params.id, employerId: req.session.user.id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    // Update the job with new data
    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// Delete a job posting
// Also deletes all applications for that job
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // Find and delete the job (only if it belongs to this employer)
    const job = await Job.findOneAndDelete({ _id: req.params.id, employerId: req.session.user.id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    // Also delete all applications for this job
    // So we don't have orphaned applications in the database
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// Get statistics for employer dashboard
// Shows total jobs, active jobs, filled jobs, and total applications
router.get('/employer/statistics', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all jobs by this employer
    const jobs = await Job.find({ employerId: req.session.user.id });
    const jobIds = jobs.map(job => job._id);
    
    // Count total applications across all their jobs
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
    
    // Count how many jobs are active vs filled
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const filledJobs = jobs.filter(j => j.status === 'filled').length;

    res.json({
      totalJobs: jobs.length,
      activeJobs,
      filledJobs,
      totalApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get statistics for job seeker dashboard
// Shows total applications and their status breakdown
router.get('/jobseeker/statistics', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all applications by this job seeker
    const applications = await Application.find({ jobseekerId: req.session.user.id });
    
    // Count applications by status
    const pending = applications.filter(a => a.status === 'pending').length;
    const reviewed = applications.filter(a => a.status === 'reviewed').length;
    const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    res.json({
      total: applications.length,
      pending,
      reviewed,
      shortlisted,
      rejected
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
