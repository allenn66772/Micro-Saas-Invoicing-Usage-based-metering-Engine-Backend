const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        Password: {
            type: String,
            required: true,
        },
        profile: {
            type: String,
        },
        role: {
            type: String,
            default: "user",
        },
        apiKey: {
            keyHash: {
                type: String,
                select: false,
            },
            prefix: {
                type: String,
            },
            createdAt: {
                type: Date,
            },
        },
    },
    { timestamps: true }
);

const users = mongoose.model("users", userSchema);
module.exports = users;