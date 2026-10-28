const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userName: { type: String, required: false },
        email: { type: String, required: true, unique: true },
        Password: { type: String, required: true },
        role: { type: String, default: "user" },
        profile: { type: String, default: "" },

        // Verification state
        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },
        verificationToken: { type: String },
        verificationTokenExpires: { type: Date },
    },
    { timestamps: true }
);

const users = mongoose.model("users", userSchema);
module.exports = users;