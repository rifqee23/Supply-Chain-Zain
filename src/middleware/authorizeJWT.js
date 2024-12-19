const jwt = require("jsonwebtoken");

function authorizeJWT(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userID = decoded.userID;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.error("Error verifikasi token:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token telah kedaluwarsa" });
    } else {
      return res.status(403).json({ message: "Token tidak valid" });
    }
  }
}

module.exports = authorizeJWT;
