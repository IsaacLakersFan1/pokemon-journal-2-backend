"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayersInGame = exports.createPlayerGame = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
// Create a relation between a player and a game
const createPlayerGame = async (req, res) => {
    const { playerId, gameId } = req.body;
    const userId = req.user?.userId; // Extract userId from the authenticated user
    if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
    }
    try {
        // Check if the player and game belong to the authenticated user
        const player = await prismaClient_1.default.player.findUnique({
            where: { id: playerId },
        });
        const game = await prismaClient_1.default.game.findUnique({
            where: { id: gameId },
        });
        if (!player || player.userId !== userId) {
            res.status(400).json({ error: 'Player not found or does not belong to the user' });
            return;
        }
        if (!game || game.userId !== userId) {
            res.status(400).json({ error: 'Game not found or does not belong to the user' });
            return;
        }
        // Create the player-game relation
        const newPlayerGame = await prismaClient_1.default.playerGame.create({
            data: {
                playerId,
                gameId,
            },
        });
        res.status(201).json({ message: 'Player linked to game successfully', playerGame: newPlayerGame });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to link player to game' });
    }
};
exports.createPlayerGame = createPlayerGame;
// Get all players associated with a specific game
const getPlayersInGame = async (req, res) => {
    const gameId = parseInt(req.params.gameId);
    try {
        const players = await prismaClient_1.default.playerGame.findMany({
            where: { gameId },
            include: {
                player: {
                    include: {
                        pokemon: {
                            select: {
                                name: true,
                                image: true, // Select the name and image fields
                            },
                        },
                    },
                },
            },
        });
        if (!players.length) {
            res.status(404).json({ error: 'No players found for this game' });
            return;
        }
        res.status(200).json({ players });
    }
    catch (error) {
        console.error('Error fetching players for the game:', error);
        res.status(500).json({ error: 'Failed to fetch players for the game' });
    }
};
exports.getPlayersInGame = getPlayersInGame;
