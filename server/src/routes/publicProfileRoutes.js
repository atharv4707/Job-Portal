const express = require("express");
const { getEmployerProfile, getJobSeekerProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/employers/:id", getEmployerProfile);
router.get("/jobseekers/:id", getJobSeekerProfile);

module.exports = router;

