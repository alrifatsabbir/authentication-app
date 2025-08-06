// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email // include email if you added it in your token
    };

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
