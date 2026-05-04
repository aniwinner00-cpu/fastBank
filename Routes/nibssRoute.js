const express = require("express");
const router = express.Router();

const nibssController = require("../Controllers/nibssController");

router.post("/login", nibssController.loginToNibss);

module.exports = router;