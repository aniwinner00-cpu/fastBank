const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        senderUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        senderAccountNumber: {
            type: String,
            required: true
        },
        receiverAccountNumber: {
            type: String,
            required: true
        },
        receiverBankCode: {
            type: String,
            required: true
        },
        receiverName: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        transactionType: {
            type: String,
            enum: ["intrabank", "interbank"],
            required: true
        },
        transactionReference: {
            type: String,
            required: true,
            unique: true
        },
        status: {
            type: String,
            enum: ["pending", "successful", "failed"],
            default: "pending"
        },
        narration: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
