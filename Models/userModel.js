const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
     required: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  bvn: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: value => !value || /^\d{11}$/.test(value),
      message: "BVN must be exactly 11 digits"
    }
  },
  nin: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: value => !value || /^\d{11}$/.test(value),
      message: "NIN must be exactly 11 digits"
    }
  },
  dob: {
    type: String,
    required: true
  },
   accountNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.pre("save", function() {
  this.fullName = `${this.firstName} ${this.middleName || ""} ${this.lastName}`
    .replace(/\s+/g, " ")
    .trim();
});

module.exports = mongoose.model("User", userSchema);
