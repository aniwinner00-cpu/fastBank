const Account = require("../Models/accountModel");
const User = require("../Models/userModel");
const nibssService = require("../services/nibssService");

// Check account balance
const getAccountBalance = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        // Ensure user owns this account
        const account = await Account.findOne({
            accountNumber,
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        // Get live balance from NIBSS
        const token = await nibssService.loginNibss();
        const balanceResponse = await nibssService.checkBalance(
            accountNumber,
            token
        );
        console.log("NIBSS BALANCE RESPONSE:", balanceResponse);

        if (!balanceResponse || balanceResponse.balance === undefined) {
    return res.status(400).json({
        message: "Failed to fetch balance"
    });
}

        // Sync local balance
        account.balance = balanceResponse.balance;
        await account.save();

        return res.status(200).json({
            message: "Balance retrieved successfully",
            data: balanceResponse
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// Name enquiry before transfer
const nameEnquiry = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const token = await nibssService.loginNibss();

        const enquiryResponse = await nibssService.nameEnquiry(
            accountNumber,
            token
        );

       if (!enquiryResponse || !enquiryResponse.accountNumber) {
    return res.status(400).json({
        message: "Name enquiry failed"
    });
}

        return res.status(200).json({
            message: "Name enquiry successful",
            data: enquiryResponse
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// Get authenticated user's account
const getMyAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "No account found"
            });
        }

        return res.status(200).json({
            message: "Account retrieved successfully",
            account
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAccountBalance,
    nameEnquiry,
    getMyAccount
};