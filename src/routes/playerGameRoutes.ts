import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { createPlayerGame, getPlayersInGame } from '../controllers/playerGameController';

const router = Router();

// Route to create the player-game relation
router.post('/player-games', authenticateJWT, createPlayerGame);
// Route to get players associated with a game
router.get('/player-games/:gameId', authenticateJWT, getPlayersInGame);


export default router;
