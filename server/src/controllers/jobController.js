const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { validateJobInput, validateJobStatus } = require("../utils/validators");
const { JOB_STATUS } = require("../config/constants");
const { serializeJob } = require("../utils/serializers");

function asArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function asPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit };
}

function parseOptionalDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Invalid deadline date");
  }

  return parsed;
}

const createJob = asyncHandler(async (req, res) => {
  const errors = validateJobInput(req.body);
  if (errors.length) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const job = await prisma.job.create({
    data: {
      employerId: req.user.id,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      requirements: asArray(req.body.requirements),
      location: req.body.location.trim(),
      jobType: req.body.jobType,
      salaryRange: typeof req.body.salaryRange === "string" ? req.body.salaryRange.trim() : "",
      deadline: parseOptionalDate(req.body.deadline),
      status: req.body.status || JOB_STATUS.OPEN
    }
  });

  res.status(201).json({
    message: "Job created",
    job: serializeJob(job)
  });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, "Job not found");

  if (job.employerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  const nextPayload = {
    title: req.body.title ?? job.title,
    description: req.body.description ?? job.description,
    location: req.body.location ?? job.location,
    jobType: req.body.jobType ?? job.jobType,
    status: req.body.status ?? job.status
  };

  const errors = validateJobInput(nextPayload);
  if (errors.length) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const updateData = {
    title: String(nextPayload.title).trim(),
    description: String(nextPayload.description).trim(),
    location: String(nextPayload.location).trim(),
    jobType: nextPayload.jobType,
    status: nextPayload.status
  };
  if (req.body.requirements !== undefined) updateData.requirements = asArray(req.body.requirements);
  if (req.body.salaryRange !== undefined) updateData.salaryRange = String(req.body.salaryRange || "").trim();
  if (req.body.deadline !== undefined) updateData.deadline = parseOptionalDate(req.body.deadline);

  const updatedJob = await prisma.job.update({
    where: { id: req.params.id },
    data: updateData
  });

  res.json({
    message: "Job updated",
    job: serializeJob(updatedJob)
  });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, "Job not found");
  if (job.employerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ message: "Job deleted" });
});

const updateJobStatus = asyncHandler(async (req, res) => {
  const statusError = validateJobStatus(req.body.status);
  if (statusError) {
    throw new ApiError(400, statusError);
  }

  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, "Job not found");
  if (job.employerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  const updatedJob = await prisma.job.update({
    where: { id: req.params.id },
    data: { status: req.body.status }
  });

  res.json({
    message: "Job status updated",
    job: serializeJob(updatedJob)
  });
});

const listJobs = asyncHandler(async (req, res) => {
  const { q, location, jobType, status } = req.query;
  const { page, limit } = asPagination(req.query);
  const skip = (page - 1) * limit;

  const where = {};
  if (q) {
    const search = String(q).trim();
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ];
  }
  if (location) {
    where.location = { contains: String(location).trim() };
  }
  if (jobType) {
    where.jobType = String(jobType).trim();
  }
  if (status) {
    const nextStatus = String(status).trim();
    const statusError = validateJobStatus(nextStatus);
    if (statusError) {
      throw new ApiError(400, statusError);
    }
    where.status = nextStatus;
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.job.count({ where })
  ]);

  res.json({
    jobs: jobs.map(serializeJob),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      employer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  if (!job) throw new ApiError(404, "Job not found");

  res.json({ job: serializeJob(job) });
});

const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { employerId: req.user.id },
    orderBy: { createdAt: "desc" }
  });
  res.json({ jobs: jobs.map(serializeJob) });
});

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  listJobs,
  getJobById,
  getEmployerJobs
};
