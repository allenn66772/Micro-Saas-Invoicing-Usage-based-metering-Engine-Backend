const User = require("../Models/userModel");
const { generateApiKey } = require("../utils/apiKeysUtils");

// Post api/keys/generate
exports.createApiKeyController = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const { rawKey, keyHash, prefix } = generateApiKey();
        const createdAt = new Date();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    apiKey: {
                        keyHash,
                        prefix,
                        createdAt
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found in database." });
        }

        return res.status(201).json({
            message: "API key generated successfully.",
            apiKey: rawKey,
            prefix,
            createdAt
        });
    } catch (error) {
        console.error("Error in createKey:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get api/key/
exports.getApiKeyController = async (req, res) => {
    console.log("Inside get api Key controller");
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        // Select just 'apiKey' instead of subpaths to avoid path collisions
        const user = await User.findById(userId).select('apiKey');

        if (!user || !user.apiKey || !user.apiKey.prefix) {
            return res.status(200).json({ hasKey: false });
        }

        return res.status(200).json({
            hasKey: true,
            prefix: user.apiKey.prefix,
            createdAt: user.apiKey.createdAt
        });
    } catch (error) {
        console.error("Error in getKeyDetails:", error);
        return res.status(500).json({ error: error.message });
    }

}