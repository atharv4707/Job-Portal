const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { JOB_STATUS } = require("../config/constants");
const { validateApplicationStatus } = require("../utils/validators");
const {
  serializeApplication,
  serializeJob,
  serializeJobSeekerProfile
} = require("../utils/serializers");

const applyToJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id }
  });
  if (!job) throw new ApiError(404, "Job not found");

  if (job.status !== JOB_STATUS.OPEN) {
    throw new ApiError(400, "Applications are closed for this job");
  }

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId: req.user.id }
  });

  try {
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        jobseekerId: req.user.id,
        coverLetter: typeof req.body.coverLetter === "string" ? req.body.coverLetter.trim() : "",
        resumeUrlSnapshot:
          typeof req.body.resumeUrlSnapshot === "string"
            ? req.body.resumeUrlSnapshot.trim()
            : profile?.resumeUrl || ""
      }
    });

    res.status(201).json({
      message: "Application submitted",
      application: serializeApplication(application)
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new ApiError(409, "You have already applied to this job");
    }
    throw error;
  }
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { jobseekerId: req.user.id },
    orderBy: { appliedAt: "desc" },
    include: { job: true }
  });

  res.json({ applications: applications.map(serializeApplication) });
});

const getApplicantsForJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id }
  });
  if (!job) throw new ApiError(404, "Job not found");
  if (job.employerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  const applications = await prisma.application.findMany({
    where: { jobId: job.id },
    orderBy: { appliedAt: "desc" },
    include: {
      jobseeker: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  const seekerIds = applications.map((app) => app.jobseeker?.id).filter(Boolean);
  const profiles = await prisma.jobSeekerProfile.findMany({
    where: { userId: { in: seekerIds } }
  });
  const profileMap = new Map(
    profiles.map((profile) => [profile.userId, serializeJobSeekerProfile(profile)])
  );

  const enrichedApplications = applications.map((application) => {
    const normalizedApplication = serializeApplication(application);
    const seekerId = normalizedApplication.jobseekerId?.id || normalizedApplication.jobseekerId?._id;

    return {
      ...normalizedApplication,
      jobseekerProfile: seekerId ? profileMap.get(seekerId) || null : null
    };
  });

  res.json({
    job: serializeJob(job),
    applications: enrichedApplications
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const statusError = validateApplicationStatus(req.body.status);
  if (statusError) {
    throw new ApiError(400, statusError);
  }

  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      job: {
        select: {
          id: true,
          employerId: true
        }
      }
    }
  });
  if (!application) throw new ApiError(404, "Application not found");

  if (application.job.employerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  const updatedApplication = await prisma.application.update({
    where: { id: req.params.id },
    data: { status: req.body.status }
  });

  res.json({
    message: "Application status updated",
    application: serializeApplication(updatedApplication)
  });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
};
