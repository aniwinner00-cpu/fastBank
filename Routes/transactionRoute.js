const express = require("express");
const router = express.Router();

const transactionController = require("../Controllers/transactionController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/transfer", authMiddleware, transactionController.transferFunds);
router.get("/status/:reference", authMiddleware, transactionController.transactionStatus);
router.get("/history", authMiddleware, transactionController.getTransactionHistory);

module.exports = router;