const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { register, login, logout, me, refresh } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;

