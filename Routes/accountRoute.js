const express = require("express");
const router = express.Router();

const accountController = require("../Controllers/accountController");
const authMiddleware = require("../Middleware/authMiddleware");

router.get("/balance/:accountNumber", authMiddleware, accountController.getAccountBalance);
router.get("/name-enquiry/:accountNumber", authMiddleware, accountController.nameEnquiry);
router.get("/my-account", authMiddleware, accountController.getMyAccount);

module.exports = router;