const crypto = require("crypto");
const Transaction = require("../Models/transactionModel");
const Account = require("../Models/accountModel");
const nibssService = require("../services/nibssService");

// Transfer funds
const transferFunds = async (req, res) => {
    
    try {
        const {
            senderAccountNumber,
            receiverAccountNumber,
            receiverBankCode,
            amount,
            narration
        } = req.body;

        // 1. Verify Sender Account
        const senderAccount = await Account.findOne({
            accountNumber: senderAccountNumber,
            userId: req.user.userId
        });

        if (!senderAccount) {
            return res.status(404).json({
                message: "Sender account not found"
            });
        }

        // 2. Check Balance
        if (senderAccount.balance < amount) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        // 3. Get NIBSS Auth Token
        const token = await nibssService.loginNibss();

        // 4. Name Enquiry (Verify Receiver)
        const enquiry = await nibssService.nameEnquiry(
            receiverAccountNumber,
            token
        );

        console.log("ENQUIRY FULL RESPONSE:", enquiry);

        if (!enquiry || !enquiry.accountNumber) {
            return res.status(400).json({
                message: enquiry.message || "Receiver account validation failed"
            });
        }
      
        console.log("BANK_CODE:", process.env.BANK_CODE);
        console.log("RECEIVER BANK CODE:", receiverBankCode);

        const transactionType =
        String(receiverBankCode) === String(process.env.BANK_CODE)
        ? "intrabank"
        : "interbank";

        // 5. Create Local Pending Transaction
        // Note: We use a temporary UUID first
        const transaction = await Transaction.create({
            senderUserId: req.user.userId,
            senderAccountNumber,
            receiverAccountNumber,
            receiverBankCode,
            receiverName: enquiry.accountName,
            amount,
            transactionType:
                receiverBankCode === process.env.BANK_CODE
                    ? "intrabank"
                    : "interbank",
            transactionReference: crypto.randomUUID(),
            narration,
            status: "pending"
        });

        // 6. Execute Transfer via NIBSS
        const transferResponse = await nibssService.transferFunds(
            senderAccountNumber,
            receiverAccountNumber,
            amount,
            receiverBankCode,
            token
        );

        // 7. Handle NIBSS Failure
       if (!transferResponse || transferResponse.status !== "SUCCESS") {
        transaction.status = "failed";
        await transaction.save();

         return res.status(400).json({
         message: transferResponse.message || "Transfer failed at NIBSS"
         });
         }

        // 8. Handle NIBSS Success
        // Update the reference to the ACTUAL NIBSS ID so Transaction Status Query (TSQ) works
        transaction.transactionReference = transferResponse.reference;
        transaction.status = "successful";
        await transaction.save();

        // 9. Local Accounting (Debit Sender)
        senderAccount.balance -= amount;
        await senderAccount.save();

        // 10. Credit local receiver if it's an internal account
        if (receiverBankCode === process.env.BANK_CODE) {
            const receiverAccount = await Account.findOne({
                accountNumber: receiverAccountNumber
            });

            if (receiverAccount) {
                receiverAccount.balance += amount;
                await receiverAccount.save();
            }
        }

        res.status(200).json({
            message: "Transfer successful",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "An internal error occurred"
        });
    }
};

// Transaction status query (TSQ)
const transactionStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const transaction = await Transaction.findOne({
            transactionReference: reference,
            senderUserId: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        const token = await nibssService.loginNibss();

        // Query NIBSS for the status using the reference ID
        const statusResponse = await nibssService.transactionStatus(
            reference,
            token
        );

        if (statusResponse.success) {
            transaction.status = statusResponse.data.status;
            await transaction.save();
        }

        res.status(200).json({
            message: "Transaction status retrieved successfully",
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get authenticated user's transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            senderUserId: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Transaction history retrieved successfully",
            transactions
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    transferFunds,
    transactionStatus,
    getTransactionHistory
};