const jwt = require('jsonwebtoken');

const authorizeAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided, failed to access resource' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.role !== 'SUPPLYER') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token, failed to access resource' });
  }
};

module.exports = authorizeAdmin;