const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {
    console.log("inside jwt middleware");

    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization failed... Token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const jwtResponse = jwt.verify(token, process.env.SecretKey);
        req.role = jwtResponse.role;
        req.payload = jwtResponse.payload;
        req.userId = jwtResponse.userId;

        next();
    } catch (err) {
        console.error("JWT Verification error:", err.message);
        return res.status(401).json({ error: "Invalid or expired token", details: err.message });
    }
};

module.exports = jwtMiddleware;