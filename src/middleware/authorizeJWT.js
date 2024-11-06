const jwt = require("jsonwebtoken");

function authorizeJWT(req, res, next) {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token yang sudah di-decode:", decoded); 
        
        req.userID = decoded.userID;
        req.role = decoded.role;
        
        next();
    } catch (error) {
        console.error("Error verifikasi token:", error);
        return res.status(403).json({ message: "Token tidak valid" });
    }
}

module.exports = authorizeJWT;