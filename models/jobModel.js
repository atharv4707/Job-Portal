const mongoose = require('mongoose');

// Define how job postings should be structured
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Job title is mandatory
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true // What the job is about
  },
  requirements: {
    type: String,
    required: true // What skills/experience needed
  },
  location: {
    type: String,
    required: true // Where the job is located
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'], // Only these options allowed
    required: true
  },
  salary: {
    type: String,
    default: 'Not disclosed' // Optional - employer can choose not to show salary
  },
  deadline: {
    type: Date,
    required: true // Last date to apply
  },
  status: {
    type: String,
    enum: ['active', 'filled', 'closed'], // Job can be active, filled, or closed
    default: 'active' // New jobs are active by default
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User who posted this job
    required: true
  },
  postedAt: {
    type: Date,
    default: Date.now // Automatically set when job is created
  }
});

module.exports = mongoose.model('Job', jobSchema);
