const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);
    req.admin = true;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
