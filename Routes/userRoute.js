const express = require("express");
const router = express.Router();

const userController = require("../Controllers/userController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;