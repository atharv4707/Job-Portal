// Import all the packages we need
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Persistent sessions for Vercel
const path = require('path');
require('dotenv').config(); // This loads our .env file

const app = express();

// Connect to MongoDB
// We use a cached connection so Vercel serverless functions don't
// open a new connection on every single request
let isConnected = false;

async function connectDB() {
  if (isConnected) return; // Already connected, skip

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.log('MongoDB connection error:', err);
  }
}

// Connect to database when server starts
connectDB().then(async () => {
  // Check if there are any jobs in the database
  const Job = require('./models/jobModel');
  const jobCount = await Job.countDocuments();

  if (jobCount === 0) {
    console.log('No jobs found. Run "npm run seed" to add sample data.');
  } else {
    console.log(`Database has ${jobCount} jobs ready.`);
  }
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
// path.join makes sure it works on both Windows and Linux (Vercel runs Linux)
app.use(express.static(path.join(__dirname, 'public')));

// Session setup - keeps users logged in
// Using MongoStore so sessions persist across Vercel serverless function calls
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Sessions expire after 24 hours
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true // Prevents JavaScript from reading the cookie
  }
}));

// Make user info available to all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Connect all our route files
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Page routes - serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'jobs.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/post-job', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employer') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'post-job.html'));
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Start server locally (Vercel handles this automatically in production)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Export app for Vercel serverless
module.exports = app;
