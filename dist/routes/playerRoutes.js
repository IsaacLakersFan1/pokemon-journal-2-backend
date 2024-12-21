"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/playerRoutes.ts
const express_1 = require("express");
const playerController_1 = require("../controllers/playerController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to get all players
router.get('/', authMiddleware_1.authenticateJWT, playerController_1.getPlayers);
// Route to create a new player
router.post('/', authMiddleware_1.authenticateJWT, playerController_1.createPlayer);
// Route to update a player by ID
router.put('/:id', authMiddleware_1.authenticateJWT, playerController_1.updatePlayer);
// Route to delete a player by ID
router.delete('/:id', authMiddleware_1.authenticateJWT, playerController_1.deletePlayer);
//Route to get player stats by ID
router.get('/stats/:playerId', authMiddleware_1.authenticateJWT, playerController_1.getTrainerStats);
//Route to get player stats by pokemon
router.get('/stats/pokemon/:playerId', authMiddleware_1.authenticateJWT, playerController_1.getPokemonsStats);
exports.default = router;
