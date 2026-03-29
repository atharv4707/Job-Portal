const mongoose = require('mongoose');

// Define how job applications should be structured
const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Links to the Job being applied for
    required: true
  },
  jobseekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User who applied
    required: true
  },
  coverLetter: {
    type: String,
    default: '' // Optional - job seeker can add a cover letter
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], // Application status
    default: 'pending' // New applications start as pending
  },
  appliedAt: {
    type: Date,
    default: Date.now // When the application was submitted
  }
});

// Prevent duplicate applications
// A user can't apply to the same job twice
applicationSchema.index({ jobId: 1, jobseekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
