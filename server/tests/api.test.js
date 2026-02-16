process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test_access_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "mysql://root:password@localhost:3306/job_portal_test";

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

async function clearDatabase() {
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.jobSeekerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();
}

describe("Job Portal API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  test("register/login + employer creates job + seeker applies once", async () => {
    const employerAgent = request.agent(app);
    const seekerAgent = request.agent(app);

    const employerRegistration = await employerAgent.post("/api/auth/register").send({
      name: "Employer User",
      email: "employer@example.com",
      password: "password123",
      role: "EMPLOYER"
    });
    expect(employerRegistration.statusCode).toBe(201);

    const createJobResponse = await employerAgent.post("/api/jobs").send({
      title: "Full Stack Developer",
      description: "Build production-grade features",
      requirements: ["Node.js", "React"],
      location: "Remote",
      jobType: "Full-time",
      status: "OPEN"
    });

    expect(createJobResponse.statusCode).toBe(201);
    const jobId = createJobResponse.body.job._id;

    const seekerRegistration = await seekerAgent.post("/api/auth/register").send({
      name: "Seeker User",
      email: "seeker@example.com",
      password: "password123",
      role: "JOBSEEKER"
    });
    expect(seekerRegistration.statusCode).toBe(201);

    const firstApply = await seekerAgent.post(`/api/jobs/${jobId}/apply`).send({
      coverLetter: "I am interested in this role."
    });
    expect(firstApply.statusCode).toBe(201);

    const secondApply = await seekerAgent.post(`/api/jobs/${jobId}/apply`).send({
      coverLetter: "Applying again."
    });
    expect(secondApply.statusCode).toBe(409);
  });

  test("authorization: seeker cannot create job, employer can only view own job applicants", async () => {
    const employerAgent = request.agent(app);
    const employer2Agent = request.agent(app);
    const seekerAgent = request.agent(app);

    await employerAgent.post("/api/auth/register").send({
      name: "Employer One",
      email: "employer1@example.com",
      password: "password123",
      role: "EMPLOYER"
    });

    await employer2Agent.post("/api/auth/register").send({
      name: "Employer Two",
      email: "employer2@example.com",
      password: "password123",
      role: "EMPLOYER"
    });

    await seekerAgent.post("/api/auth/register").send({
      name: "Seeker User",
      email: "seeker2@example.com",
      password: "password123",
      role: "JOBSEEKER"
    });

    const forbiddenJobCreate = await seekerAgent.post("/api/jobs").send({
      title: "Unauthorized Job",
      description: "Should fail",
      location: "Remote",
      jobType: "Full-time"
    });
    expect(forbiddenJobCreate.statusCode).toBe(403);

    const createdJob = await employerAgent.post("/api/jobs").send({
      title: "Backend Engineer",
      description: "Build APIs",
      location: "Pune",
      jobType: "Full-time"
    });
    expect(createdJob.statusCode).toBe(201);

    const jobId = createdJob.body.job._id;

    const applyResult = await seekerAgent.post(`/api/jobs/${jobId}/apply`).send({
      coverLetter: "Please consider my profile."
    });
    expect(applyResult.statusCode).toBe(201);

    const ownerApplicants = await employerAgent.get(`/api/employer/jobs/${jobId}/applications`);
    expect(ownerApplicants.statusCode).toBe(200);
    expect(ownerApplicants.body.applications).toHaveLength(1);

    const nonOwnerApplicants = await employer2Agent.get(`/api/employer/jobs/${jobId}/applications`);
    expect(nonOwnerApplicants.statusCode).toBe(403);
  });
});
