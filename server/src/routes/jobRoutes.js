const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");
const {
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  listJobs,
  getJobById
} = require("../controllers/jobController");
const { applyToJob } = require("../controllers/applicationController");

const router = express.Router();

router.get("/", listJobs);
router.get("/:id", getJobById);
router.post("/", requireAuth, requireRole(ROLES.EMPLOYER), createJob);
router.put("/:id", requireAuth, requireRole(ROLES.EMPLOYER), updateJob);
router.delete("/:id", requireAuth, requireRole(ROLES.EMPLOYER), deleteJob);
router.patch("/:id/status", requireAuth, requireRole(ROLES.EMPLOYER), updateJobStatus);
router.post("/:id/apply", requireAuth, requireRole(ROLES.JOBSEEKER), applyToJob);

module.exports = router;

