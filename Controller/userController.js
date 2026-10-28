const bcrypt = require("bcrypt");
const users = require("../Models/userModel");
const jwt = require("jsonwebtoken")
const { sendOtpEmail } = require("../services/mailService");
// const users=require("../Models/userModel")


exports.userRegisterController = async (req, res) => {
    const { userName, email, Password } = req.body;

    try {
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists. Please login." });
        }

        const encryptpassword = await bcrypt.hash(Password, 10);

        // Generate random 6-digit code
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set 10-minute expiry
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = new users({
            userName,
            email,
            Password: encryptpassword,
            profile: "",
            isVerified: false,
            otp: generatedOtp,
            otpExpires,
        });

        await newUser.save();

        // Send the email via Gmail
        await sendOtpEmail(email, generatedOtp);

        return res.status(201).json({
            message: "Registration successful. A 6-digit verification code has been sent to your email.",
            email: newUser.email,
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ error: error.message || "Registration failed." });
    }
};

// 2. VERIFY OTP: Validates the 6-digit code
exports.verifyOtpController = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and verification code are required." });
    }

    try {
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified. Please login." });
        }

        // Check code match
        if (user.otp !== otp.toString().trim()) {
            return res.status(400).json({ error: "Invalid verification code." });
        }

        // Check expiry
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Verification code has expired. Please register or request a new code." });
        }

        // Mark verified and remove OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ error: "Failed to verify code." });
    }
};

// 3. LOGIN: Ensures user is verified before generating JWT
exports.userLoginController = async (req, res) => {
    const { email, Password } = req.body;

    try {
        const existingUser = await users.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "Invalid Email. Please register." });
        }

        if (!existingUser.isVerified) {
            return res.status(403).json({
                error: "Account not verified. Please verify your 6-digit code first.",
            });
        }

        const isPasswordValid = await bcrypt.compare(Password, existingUser.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email/password." });
        }

        const token = jwt.sign(
            { email, role: existingUser.role, userId: existingUser._id },
            process.env.SecretKey,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            user: {
                _id: existingUser._id,
                email: existingUser.email,
                userName: existingUser.userName,
                role: existingUser.role,
            },
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Login failed." });
    }
};