const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define how user data should be structured in the database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name is mandatory
    trim: true // Remove extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have same email
    lowercase: true, // Store email in lowercase
    trim: true
  },
  password: {
    type: String,
    required: true // Password is mandatory
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer'], // Can only be one of these two
    required: true
  },
  phone: {
    type: String,
    default: '' // Optional field
  },
  // Fields specific to job seekers
  skills: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  // Fields specific to employers
  companyName: {
    type: String,
    default: ''
  },
  companyDescription: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when user is created
  }
});

// Before saving a user, hash their password
// This is important for security - we never store plain text passwords
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or has been changed
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt (random data) and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if entered password matches the hashed password
// We use this during login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
