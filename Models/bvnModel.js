const mongoose = require("mongoose");

const bvnSchema = new mongoose.Schema({
    bvn: {
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

module.exports = mongoose.model("Bvn", bvnSchema);