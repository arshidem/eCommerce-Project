const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    
    
  },
  role: {
    type: String,
    default: "admin",
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const AdminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
module.exports = AdminModel;
