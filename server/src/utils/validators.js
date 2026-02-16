const { ROLES, JOB_STATUS, APPLICATION_STATUS, JOB_TYPES } = require("../config/constants");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function assertEnumValue(value, values, fieldName) {
  if (!values.includes(value)) {
    return `${fieldName} must be one of: ${values.join(", ")}`;
  }
  return null;
}

function validateRegisterInput(body) {
  const errors = [];

  if (!isNonEmptyString(body.name)) errors.push("name is required");
  if (!isValidEmail(body.email)) errors.push("valid email is required");
  if (!isNonEmptyString(body.password) || body.password.length < 6) {
    errors.push("password must be at least 6 characters");
  }
  const roleError = assertEnumValue(body.role, [ROLES.JOBSEEKER, ROLES.EMPLOYER], "role");
  if (roleError) errors.push(roleError);

  return errors;
}

function validateLoginInput(body) {
  const errors = [];

  if (!isValidEmail(body.email)) errors.push("valid email is required");
  if (!isNonEmptyString(body.password)) errors.push("password is required");

  return errors;
}

function validateJobInput(body) {
  const errors = [];

  if (!isNonEmptyString(body.title)) errors.push("title is required");
  if (!isNonEmptyString(body.description)) errors.push("description is required");
  if (!isNonEmptyString(body.location)) errors.push("location is required");
  if (!isNonEmptyString(body.jobType)) errors.push("jobType is required");

  if (body.jobType && !JOB_TYPES.includes(body.jobType)) {
    errors.push(`jobType must be one of: ${JOB_TYPES.join(", ")}`);
  }

  if (body.status) {
    const statusError = assertEnumValue(body.status, Object.values(JOB_STATUS), "status");
    if (statusError) errors.push(statusError);
  }

  return errors;
}

function validateApplicationStatus(status) {
  return assertEnumValue(status, Object.values(APPLICATION_STATUS), "status");
}

function validateJobStatus(status) {
  return assertEnumValue(status, Object.values(JOB_STATUS), "status");
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateJobInput,
  validateApplicationStatus,
  validateJobStatus
};

