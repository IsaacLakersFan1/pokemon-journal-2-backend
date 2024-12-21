"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const playerGameController_1 = require("../controllers/playerGameController");
const router = (0, express_1.Router)();
// Route to create the player-game relation
router.post('/player-games', authMiddleware_1.authenticateJWT, playerGameController_1.createPlayerGame);
// Route to get players associated with a game
router.get('/player-games/:gameId', authMiddleware_1.authenticateJWT, playerGameController_1.getPlayersInGame);
exports.default = router;
