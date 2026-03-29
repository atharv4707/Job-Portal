// This script adds sample data to the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/userModel');
const Job = require('./models/jobModel');

// Sample jobs data
const sampleJobs = [
  {
    title: "Frontend Developer",
    company: "Tech Solutions Inc",
    description: "We're looking for a talented frontend developer to join our team. You'll work on building beautiful and responsive web applications using modern technologies. Great opportunity to work on exciting projects and grow your skills.",
    requirements: "Strong knowledge of HTML, CSS, JavaScript. Experience with React or Vue.js is a plus. Good understanding of responsive design and modern web development practices.",
    location: "Mumbai, Maharashtra",
    jobType: "Full-time",
    salary: "₹6,00,000 - ₹10,00,000 per year",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: "Backend Developer",
    company: "Digital Innovations",
    description: "Join our backend team to build scalable APIs and microservices. You'll work with cutting-edge technologies and contribute to products used by thousands of users daily.",
    requirements: "Experience with Node.js and Express. Knowledge of MongoDB or PostgreSQL. Understanding of REST APIs and authentication systems. Ability to write clean, maintainable code.",
    location: "Bangalore, Karnataka",
    jobType: "Full-time",
    salary: "₹8,00,000 - ₹12,00,000 per year",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studios",
    description: "We need a creative designer who can make our products look amazing and easy to use. You'll design interfaces for web and mobile apps, create prototypes, and work closely with developers.",
    requirements: "Portfolio showcasing UI/UX work. Proficiency in Figma or Adobe XD. Understanding of user-centered design principles. Good communication skills.",
    location: "Pune, Maharashtra",
    jobType: "Full-time",
    salary: "₹5,00,000 - ₹8,00,000 per year",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Data Analyst Intern",
    company: "Analytics Pro",
    description: "Great internship opportunity for students interested in data analysis. You'll work with real datasets, create visualizations, and help make data-driven decisions.",
    requirements: "Currently pursuing degree in Computer Science, Statistics, or related field. Basic knowledge of Python or R. Familiarity with Excel. Eager to learn.",
    location: "Delhi, NCR",
    jobType: "Internship",
    salary: "₹15,000 - ₹20,000 per month",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Full Stack Developer",
    company: "StartupHub",
    description: "Looking for a versatile developer who can work on both frontend and backend. You'll be involved in all stages of product development in a fast-paced startup environment.",
    requirements: "Experience with MERN stack (MongoDB, Express, React, Node.js). Ability to work independently and in a team. Problem-solving skills and quick learner.",
    location: "Hyderabad, Telangana",
    jobType: "Full-time",
    salary: "₹10,00,000 - ₹15,00,000 per year",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Content Writer",
    company: "Media House",
    description: "We're hiring writers to create engaging content for our website and blog. Work from anywhere and set your own schedule. Perfect for creative writers.",
    requirements: "Excellent English writing skills. Experience in content writing or journalism preferred. Ability to research topics and write clearly. Meet deadlines consistently.",
    location: "Remote",
    jobType: "Remote",
    salary: "₹3,00,000 - ₹5,00,000 per year",
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Digital Marketing Specialist",
    company: "Marketing Experts",
    description: "Join our marketing team to plan and execute digital campaigns. You'll work on SEO, social media marketing, email campaigns, and more.",
    requirements: "2+ years experience in digital marketing. Knowledge of Google Analytics, SEO tools, and social media platforms. Good communication and analytical skills.",
    location: "Chennai, Tamil Nadu",
    jobType: "Full-time",
    salary: "₹4,00,000 - ₹7,00,000 per year",
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Python Developer",
    company: "AI Solutions",
    description: "We need Python developers to work on machine learning and automation projects. Great opportunity to work with cutting-edge AI technologies.",
    requirements: "Strong Python programming skills. Experience with Pandas, NumPy. Knowledge of Django or Flask is a plus. Ability to write efficient code.",
    location: "Kolkata, West Bengal",
    jobType: "Contract",
    salary: "₹7,00,000 - ₹11,00,000 per year",
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Mobile App Developer",
    company: "AppTech Solutions",
    description: "Looking for mobile developers to build iOS and Android applications. You'll work on consumer-facing apps with millions of downloads.",
    requirements: "Experience with React Native or Flutter. Knowledge of mobile app development best practices. Understanding of app store deployment process.",
    location: "Gurgaon, Haryana",
    jobType: "Full-time",
    salary: "₹9,00,000 - ₹14,00,000 per year",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    title: "DevOps Engineer",
    company: "Cloud Systems",
    description: "Join our DevOps team to manage infrastructure and deployment pipelines. You'll work with cloud platforms and automation tools.",
    requirements: "Experience with AWS or Azure. Knowledge of Docker and Kubernetes. Understanding of CI/CD pipelines. Linux system administration skills.",
    location: "Bangalore, Karnataka",
    jobType: "Full-time",
    salary: "₹12,00,000 - ₹18,00,000 per year",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Check if jobs already exist
    const existingJobs = await Job.countDocuments();
    if (existingJobs > 0) {
      console.log(`Database already has ${existingJobs} jobs. Skipping seed.`);
      await mongoose.connection.close();
      return;
    }

    // Create a demo employer account
    console.log('Creating demo employer account...');
    let demoEmployer = await User.findOne({ email: 'employer@demo.com' });
    
    if (!demoEmployer) {
      demoEmployer = new User({
        name: 'Demo Employer',
        email: 'employer@demo.com',
        password: 'demo123', // Will be hashed automatically
        role: 'employer',
        companyName: 'Demo Company'
      });
      await demoEmployer.save();
      console.log('Demo employer created!');
      console.log('Email: employer@demo.com');
      console.log('Password: demo123');
    }

    // Add sample jobs
    console.log('Adding sample jobs...');
    const jobsWithEmployer = sampleJobs.map(job => ({
      ...job,
      employerId: demoEmployer._id,
      status: 'active'
    }));

    await Job.insertMany(jobsWithEmployer);
    console.log(`Successfully added ${sampleJobs.length} sample jobs!`);

    // Create a demo job seeker account
    console.log('Creating demo job seeker account...');
    let demoJobSeeker = await User.findOne({ email: 'jobseeker@demo.com' });
    
    if (!demoJobSeeker) {
      demoJobSeeker = new User({
        name: 'Demo Job Seeker',
        email: 'jobseeker@demo.com',
        password: 'demo123', // Will be hashed automatically
        role: 'jobseeker',
        skills: 'JavaScript, React, Node.js',
        experience: '2 years in web development'
      });
      await demoJobSeeker.save();
      console.log('Demo job seeker created!');
      console.log('Email: jobseeker@demo.com');
      console.log('Password: demo123');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('Employer: employer@demo.com / demo123');
    console.log('Job Seeker: jobseeker@demo.com / demo123');
    console.log(`\n💼 Total Jobs: ${sampleJobs.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
