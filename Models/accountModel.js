const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        accountType: {
            type: String,
             enum: ["savings", "current", "business"],
             default: "savings"
            },
        accountNumber: {
            type: String,
            required: true,
            unique: true
        },
        accountName: {
            type: String,
             required: true
        },
        bankCode: {
            type: String,
            required: true
        },
        bankName: {
            type: String,
            required: true
        },
        balance: {
            type: Number,
            default: 0
        },
        kycType: {
            type: String,
              enum: ["bvn", "nin"],
            required: true
        },
        kycID: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
      {
        timestamps: true
    }
);

module.exports = mongoose.model("Account", accountSchema);