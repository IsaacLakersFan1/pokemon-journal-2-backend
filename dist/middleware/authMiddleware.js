"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'secret';
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(403).json({ error: 'Access denied. No token provided.' });
        return; // Ensure no further execution happens
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY); // Decode token and get userId
        req.user = decoded; // Use type assertion to add `user` to `req`
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Invalid or expired token' });
        return; // Ensure no further execution happens
    }
};
exports.authenticateJWT = authenticateJWT;
