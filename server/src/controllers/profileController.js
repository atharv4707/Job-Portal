const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const pickPublicUser = require("../utils/pickPublicUser");
const { ROLES } = require("../config/constants");
const { serializeJobSeekerProfile } = require("../utils/serializers");

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

const getMyProfile = asyncHandler(async (req, res) => {
  let profile;
  if (req.user.role === ROLES.JOBSEEKER) {
    profile = serializeJobSeekerProfile(await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user.id }
    }));
  } else if (req.user.role === ROLES.EMPLOYER) {
    profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });
  }

  res.json({
    user: pickPublicUser(req.user),
    profile
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (typeof name === "string" && name.trim()) {
    const nextName = name.trim();
    req.user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: nextName }
    });
  }

  let profile;

  if (req.user.role === ROLES.JOBSEEKER) {
    profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) throw new ApiError(404, "Profile not found");

    const nextData = {};
    if (typeof req.body.phone === "string") nextData.phone = req.body.phone.trim();
    if (typeof req.body.location === "string") nextData.location = req.body.location.trim();
    if (typeof req.body.resumeUrl === "string") nextData.resumeUrl = req.body.resumeUrl.trim();

    const skills = asStringArray(req.body.skills);
    const education = asStringArray(req.body.education);
    const experience = asStringArray(req.body.experience);

    if (skills) nextData.skills = skills;
    if (education) nextData.education = education;
    if (experience) nextData.experience = experience;

    if (Object.keys(nextData).length > 0) {
      profile = await prisma.jobSeekerProfile.update({
        where: { userId: req.user.id },
        data: nextData
      });
    }
    profile = serializeJobSeekerProfile(profile);
  } else if (req.user.role === ROLES.EMPLOYER) {
    profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) throw new ApiError(404, "Profile not found");

    const nextData = {};

    if (typeof req.body.companyName === "string") nextData.companyName = req.body.companyName.trim();
    if (typeof req.body.companyWebsite === "string") {
      nextData.companyWebsite = req.body.companyWebsite.trim();
    }
    if (typeof req.body.companyDescription === "string") {
      nextData.companyDescription = req.body.companyDescription.trim();
    }
    if (typeof req.body.location === "string") nextData.location = req.body.location.trim();

    if (Object.keys(nextData).length > 0) {
      profile = await prisma.employerProfile.update({
        where: { userId: req.user.id },
        data: nextData
      });
    }
  }

  res.json({
    message: "Profile updated",
    user: pickPublicUser(req.user),
    profile
  });
});

const getEmployerProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.role !== ROLES.EMPLOYER) {
    throw new ApiError(404, "Employer not found");
  }

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: user.id }
  });

  res.json({
    user: pickPublicUser(user),
    profile
  });
});

const getJobSeekerProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.role !== ROLES.JOBSEEKER) {
    throw new ApiError(404, "Job seeker not found");
  }

  const profile = serializeJobSeekerProfile(await prisma.jobSeekerProfile.findUnique({
    where: { userId: user.id }
  }));

  res.json({
    user: pickPublicUser(user),
    profile
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getEmployerProfile,
  getJobSeekerProfile
};
