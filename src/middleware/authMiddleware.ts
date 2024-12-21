import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number; // The type of `userId` that you'll get from the JWT payload
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(403).json({ error: 'Access denied. No token provided.' });
    return;  // Ensure no further execution happens
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number }; // Decode token and get userId
    (req as AuthenticatedRequest).user = decoded;  // Use type assertion to add `user` to `req`
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid or expired token' });
    return;  // Ensure no further execution happens
  }
};
