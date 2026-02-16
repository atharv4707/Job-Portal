function withLegacyIdAlias(record) {
  if (!record || typeof record !== "object") {
    return record;
  }

  return {
    ...record,
    _id: record.id
  };
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_error) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function serializeUserLite(user) {
  if (!user) return user;
  const normalized = withLegacyIdAlias(user);
  return normalized;
}

function serializeJob(job) {
  if (!job) return job;

  const normalized = withLegacyIdAlias(job);
  normalized.requirements = normalizeStringArray(normalized.requirements);

  if (normalized.employer) {
    normalized.employerId = serializeUserLite(normalized.employer);
    delete normalized.employer;
  }

  return normalized;
}

function serializeApplication(application) {
  if (!application) return application;

  const normalized = withLegacyIdAlias(application);

  if (normalized.job) {
    normalized.jobId = serializeJob(normalized.job);
    delete normalized.job;
  }

  if (normalized.jobseeker) {
    normalized.jobseekerId = serializeUserLite(normalized.jobseeker);
    delete normalized.jobseeker;
  }

  return normalized;
}

function serializeJobSeekerProfile(profile) {
  if (!profile) return profile;

  const normalized = withLegacyIdAlias(profile);
  normalized.skills = normalizeStringArray(normalized.skills);
  normalized.education = normalizeStringArray(normalized.education);
  normalized.experience = normalizeStringArray(normalized.experience);
  return normalized;
}

module.exports = {
  withLegacyIdAlias,
  normalizeStringArray,
  serializeUserLite,
  serializeJob,
  serializeApplication,
  serializeJobSeekerProfile
};
