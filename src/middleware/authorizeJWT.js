const jwt = require("jsonwebtoken");

function authorizeJWT(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "No token provided, failed to access resource" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user_id = decoded.user_id
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token, failed to access resource" });
    }
}

module.exports = authorizeJWT;