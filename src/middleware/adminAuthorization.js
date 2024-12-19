const jwt = require("jsonwebtoken");

const authorizeAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (decoded.role !== "SUPPLIER") {
      return res
        .status(403)
        .json({ message: "Access denied. Supplier role required" });
    }

    req.user = {
      userID: decoded.userID,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token telah kedaluwarsa" });
    } else {
      return res.status(403).json({ message: error.message });
    }
  }
};

module.exports = authorizeAdmin;
