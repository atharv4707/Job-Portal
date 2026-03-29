// Sample job data for testing the application
// You can use this data to quickly populate your job portal

const sampleJobs = [
  {
    title: "Frontend Developer",
    company: "Tech Solutions Inc",
    description: "We're looking for someone who can build beautiful and responsive websites. You'll work with our design team to create user interfaces that people love to use. This is a great opportunity to work on exciting projects and learn new technologies.",
    requirements: "You should know HTML, CSS, and JavaScript well. Experience with React or Vue.js would be great but not required. We value creativity and problem-solving skills. If you're passionate about creating great user experiences, we want to hear from you.",
    location: "Mumbai, Maharashtra",
    jobType: "Full-time",
    salary: "₹6,00,000 - ₹10,00,000 per year",
    deadline: "2024-12-31"
  },
  {
    title: "Backend Developer",
    company: "Digital Innovations",
    description: "Join our backend team to build powerful APIs and services. You'll work on creating scalable systems that handle thousands of users. We use modern technologies and follow best practices. This role offers great learning opportunities and career growth.",
    requirements: "Strong knowledge of Node.js and Express is required. You should understand how databases work (MongoDB or PostgreSQL). Experience with REST APIs and authentication systems is important. We're looking for someone who writes clean, maintainable code.",
    location: "Bangalore, Karnataka",
    jobType: "Full-time",
    salary: "₹8,00,000 - ₹12,00,000 per year",
    deadline: "2024-12-25"
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studios",
    description: "We need a creative designer who can make our products look amazing and easy to use. You'll design interfaces for web and mobile apps, create prototypes, and work closely with developers. If you love design and want to make a real impact, this is the job for you.",
    requirements: "You should have a portfolio showing your design work. Knowledge of Figma or Adobe XD is essential. Understanding of user-centered design and usability principles is important. We value creativity, attention to detail, and good communication skills.",
    location: "Pune, Maharashtra",
    jobType: "Full-time",
    salary: "₹5,00,000 - ₹8,00,000 per year",
    deadline: "2024-12-20"
  },
  {
    title: "Data Analyst Intern",
    company: "Analytics Pro",
    description: "Great internship opportunity for students interested in data analysis. You'll work with real datasets, create visualizations, and help make data-driven decisions. This is a perfect way to gain practical experience and learn from experienced professionals.",
    requirements: "Currently studying Computer Science, Statistics, or related field. Basic knowledge of Python or R is helpful. Familiarity with Excel is required. We're looking for someone who is curious, eager to learn, and good with numbers.",
    location: "Delhi, NCR",
    jobType: "Internship",
    salary: "₹15,000 - ₹20,000 per month",
    deadline: "2024-12-15"
  },
  {
    title: "Full Stack Developer",
    company: "StartupHub",
    description: "Looking for a versatile developer who can work on both frontend and backend. You'll be involved in all stages of product development, from planning to deployment. This is a startup environment where you'll have a lot of responsibility and freedom to make decisions.",
    requirements: "Experience with MERN stack (MongoDB, Express, React, Node.js) is required. You should be comfortable working independently and as part of a team. Problem-solving skills and ability to learn quickly are essential. We value people who take initiative and ownership.",
    location: "Hyderabad, Telangana",
    jobType: "Full-time",
    salary: "₹10,00,000 - ₹15,00,000 per year",
    deadline: "2024-12-30"
  },
  {
    title: "Content Writer",
    company: "Media House",
    description: "We're hiring writers to create engaging content for our website and blog. You'll write articles, blog posts, and marketing copy. If you love writing and have a way with words, this could be your dream job. Work from anywhere and set your own schedule.",
    requirements: "Excellent English writing skills are a must. Experience in content writing or journalism is preferred but not required. You should be able to research topics and write clearly. Creativity and ability to meet deadlines are important.",
    location: "Remote",
    jobType: "Remote",
    salary: "₹3,00,000 - ₹5,00,000 per year",
    deadline: "2024-12-18"
  },
  {
    title: "Digital Marketing Specialist",
    company: "Marketing Experts",
    description: "Join our marketing team to plan and execute digital campaigns. You'll work on SEO, social media marketing, email campaigns, and more. This role is perfect for someone who loves marketing and wants to see real results from their work.",
    requirements: "2+ years of experience in digital marketing is required. Knowledge of Google Analytics, SEO tools, and social media platforms is essential. You should understand how to create and measure marketing campaigns. Good communication and analytical skills are important.",
    location: "Chennai, Tamil Nadu",
    jobType: "Full-time",
    salary: "₹4,00,000 - ₹7,00,000 per year",
    deadline: "2024-12-22"
  },
  {
    title: "Python Developer",
    company: "AI Solutions",
    description: "We need Python developers to work on machine learning and automation projects. You'll build data processing pipelines, create APIs, and work with cutting-edge AI technologies. This is a great opportunity to work on innovative projects.",
    requirements: "Strong Python programming skills are essential. Experience with libraries like Pandas and NumPy is required. Knowledge of Django or Flask is a plus. We're looking for someone who can write efficient, clean code and solve complex problems.",
    location: "Kolkata, West Bengal",
    jobType: "Contract",
    salary: "₹7,00,000 - ₹11,00,000 per year",
    deadline: "2024-12-28"
  }
];

// Instructions for using this sample data
console.log("\n=== JobConnect Sample Data ===\n");
console.log("How to use this sample data:\n");
console.log("1. Start your application (npm start)");
console.log("2. Register as an employer");
console.log("3. Login and go to 'Post a Job'");
console.log("4. Copy the data from above and paste into the form");
console.log("5. Post multiple jobs to make your portal look active\n");
console.log(`Total sample jobs available: ${sampleJobs.length}\n`);
console.log("Job types included:");
console.log("- Full-time positions (5)");
console.log("- Internships (1)");
console.log("- Remote work (1)");
console.log("- Contract positions (1)\n");
console.log("This will help you test all features of your job portal!\n");

// Export the data if needed
module.exports = sampleJobs;
