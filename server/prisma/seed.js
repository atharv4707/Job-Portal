const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

const seedUsers = {
  employer: {
    name: "Seed Employer",
    email: "employer.seed@hirescape.local",
    role: "EMPLOYER"
  },
  seeker: {
    name: "Seed Jobseeker",
    email: "seeker.seed@hirescape.local",
    role: "JOBSEEKER"
  }
};

const seedJobs = [
  {
    title: "[Seed] Frontend Developer",
    description: "Build responsive UI components and collaborate closely with product teams.",
    requirements: ["JavaScript", "HTML", "CSS", "React"],
    location: "Bengaluru",
    jobType: "Full-time",
    salaryRange: "8-14 LPA",
    status: "OPEN"
  },
  {
    title: "[Seed] Backend Node.js Engineer",
    description: "Design APIs, optimize queries, and improve backend reliability.",
    requirements: ["Node.js", "Express", "MySQL", "Prisma"],
    location: "Pune",
    jobType: "Full-time",
    salaryRange: "10-18 LPA",
    status: "OPEN"
  },
  {
    title: "[Seed] Product Designer",
    description: "Create user flows, wireframes, and polished design systems for web apps.",
    requirements: ["Figma", "UX Research", "Design Systems"],
    location: "Remote",
    jobType: "Contract",
    salaryRange: "6-10 LPA",
    status: "OPEN"
  }
];

async function upsertSeedUser(user, passwordHash) {
  return prisma.user.upsert({
    where: { email: user.email },
    create: {
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role
    },
    update: {
      name: user.name,
      passwordHash,
      role: user.role
    }
  });
}

async function ensureProfiles(employerId, seekerId) {
  await prisma.employerProfile.upsert({
    where: { userId: employerId },
    create: {
      userId: employerId,
      companyName: "Hirescape Labs",
      companyWebsite: "https://hirescape.local",
      companyDescription: "Seed company used for local development demos.",
      location: "Bengaluru"
    },
    update: {
      companyName: "Hirescape Labs",
      companyWebsite: "https://hirescape.local",
      companyDescription: "Seed company used for local development demos.",
      location: "Bengaluru"
    }
  });

  await prisma.jobSeekerProfile.upsert({
    where: { userId: seekerId },
    create: {
      userId: seekerId,
      phone: "+91-9000000000",
      location: "Pune",
      skills: ["JavaScript", "Node.js", "React"],
      education: ["B.Tech - Computer Science"],
      experience: ["2 years full-stack web development"],
      resumeUrl: "https://example.com/resume/seed-jobseeker"
    },
    update: {
      phone: "+91-9000000000",
      location: "Pune",
      skills: ["JavaScript", "Node.js", "React"],
      education: ["B.Tech - Computer Science"],
      experience: ["2 years full-stack web development"],
      resumeUrl: "https://example.com/resume/seed-jobseeker"
    }
  });
}

async function resetSeedJobs(employerId) {
  await prisma.application.deleteMany({
    where: {
      job: {
        employerId,
        title: { startsWith: "[Seed]" }
      }
    }
  });

  await prisma.job.deleteMany({
    where: {
      employerId,
      title: { startsWith: "[Seed]" }
    }
  });
}

async function createSeedJobs(employerId) {
  const createdJobs = [];
  for (const job of seedJobs) {
    const created = await prisma.job.create({
      data: {
        employerId,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        jobType: job.jobType,
        salaryRange: job.salaryRange,
        status: job.status
      }
    });
    createdJobs.push(created);
  }
  return createdJobs;
}

async function createSampleApplication(jobId, seekerId) {
  await prisma.application.upsert({
    where: {
      jobId_jobseekerId: {
        jobId,
        jobseekerId: seekerId
      }
    },
    create: {
      jobId,
      jobseekerId: seekerId,
      coverLetter:
        "Hi, I have relevant full-stack experience and would like to be considered for this role.",
      resumeUrlSnapshot: "https://example.com/resume/seed-jobseeker",
      status: "UNDER_REVIEW"
    },
    update: {
      coverLetter:
        "Hi, I have relevant full-stack experience and would like to be considered for this role.",
      resumeUrlSnapshot: "https://example.com/resume/seed-jobseeker",
      status: "UNDER_REVIEW"
    }
  });
}

async function main() {
  const rawPassword = process.env.SEED_PASSWORD || "Password123!";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const employer = await upsertSeedUser(seedUsers.employer, passwordHash);
  const seeker = await upsertSeedUser(seedUsers.seeker, passwordHash);

  await ensureProfiles(employer.id, seeker.id);
  await resetSeedJobs(employer.id);

  const jobs = await createSeedJobs(employer.id);
  await createSampleApplication(jobs[0].id, seeker.id);

  console.log("Seed completed.");
  console.log(`Employer login: ${seedUsers.employer.email}`);
  console.log(`Job seeker login: ${seedUsers.seeker.email}`);
  console.log(`Password: ${rawPassword}`);
  console.log(`Seeded jobs: ${jobs.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
