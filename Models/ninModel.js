const mongoose = require("mongoose");

const ninSchema = new mongoose.Schema({
    nin: {
        type: String,
        required: true,
        unique: true
    },
    firstName: String,
    middleName: String,
    lastName: String,
    dob: String,
    phone: String,
    valid: {
        type: Boolean,
        default: true
        },
    source: {
        type: String,
        default: "NIBSS"
    }
}, { timestamps: true });

module.exports = mongoose.model("Nin", ninSchema);