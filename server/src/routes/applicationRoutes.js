const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");
const {
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
} = require("../controllers/applicationController");
const { getEmployerJobs } = require("../controllers/jobController");

const router = express.Router();

router.get("/jobseeker/applications", requireAuth, requireRole(ROLES.JOBSEEKER), getMyApplications);
router.get("/employer/jobs", requireAuth, requireRole(ROLES.EMPLOYER), getEmployerJobs);
router.get(
  "/employer/jobs/:id/applications",
  requireAuth,
  requireRole(ROLES.EMPLOYER),
  getApplicantsForJob
);
router.patch(
  "/applications/:id/status",
  requireAuth,
  requireRole(ROLES.EMPLOYER),
  updateApplicationStatus
);

module.exports = router;

