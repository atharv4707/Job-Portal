const ROLES = {
  JOBSEEKER: "JOBSEEKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN"
};

const JOB_STATUS = {
  OPEN: "OPEN",
  FILLED: "FILLED",
  CLOSED: "CLOSED"
};

const APPLICATION_STATUS = {
  APPLIED: "APPLIED",
  UNDER_REVIEW: "UNDER_REVIEW",
  REJECTED: "REJECTED",
  SELECTED: "SELECTED"
};

const JOB_TYPES = ["Internship", "Full-time", "Part-time", "Remote"];

module.exports = {
  ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  JOB_TYPES
};

