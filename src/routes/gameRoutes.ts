import express from 'express';
import { createGame, deleteGame, getAllGames } from '../controllers/gameController';
import { authenticateJWT } from '../middleware/authMiddleware'; // Import the JWT middleware

const router = express.Router();

// Apply authenticateJWT middleware to game routes that require authentication
router.get('/games',authenticateJWT, getAllGames);
router.post('/', authenticateJWT, createGame); // Create game
router.delete('/:id', authenticateJWT, deleteGame); // Delete game



export default router;
