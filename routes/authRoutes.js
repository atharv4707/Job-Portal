const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Handle user registration
// This is called when someone fills out the sign-up form
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // First, check if this email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user object with the provided data
    const userData = { name, email, password, role };
    
    // If user is an employer, add company name
    if (role === 'employer' && companyName) {
      userData.companyName = companyName;
    }

    // Save the new user to database
    // Password will be automatically hashed by the userModel
    const user = new User(userData);
    await user.save();

    res.status(201).json({ message: 'Registration successful', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Handle user login
// This is called when someone tries to log in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    // comparePassword is a method we defined in userModel
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create a session to keep user logged in
    // We store basic user info in the session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({ 
      message: 'Login successful', 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Handle logout
// This destroys the session and logs the user out
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current logged in user
// Used to check if someone is logged in
router.get('/current', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Get full user profile with all details
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user from database (excluding password)
    const user = await User.findById(req.session.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
// This is called when user updates their profile information
router.put('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, phone, skills, experience, education, companyName, companyDescription } = req.body;

    // Find the user in database
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update common fields
    user.name = name || user.name;
    user.phone = phone || user.phone;

    // Update role-specific fields
    if (user.role === 'jobseeker') {
      user.skills = skills || user.skills;
      user.experience = experience || user.experience;
      user.education = education || user.education;
    } else if (user.role === 'employer') {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
    }

    // Save changes to database
    await user.save();

    // Update session with new name
    req.session.user.name = user.name;

    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
