"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGames = exports.deleteGame = exports.createGame = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
// Create a new game
const createGame = async (req, res) => {
    const { name, playerCount } = req.body;
    const userId = req.user?.userId; // Access the userId from the JWT payload
    if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
    }
    try {
        const newGame = await prismaClient_1.default.game.create({
            data: {
                name,
                playerCount,
                userId, // Associate the game with the authenticated user
            },
        });
        res.status(201).json({ message: 'Game created successfully', game: newGame });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};
exports.createGame = createGame;
// Delete a game by ID
const deleteGame = async (req, res) => {
    const gameId = parseInt(req.params.id);
    const userId = req.user?.userId; // Access the userId from the JWT payload
    if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
    }
    try {
        // Check if the game exists and is associated with the user
        const game = await prismaClient_1.default.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        if (game.userId !== userId) {
            res.status(403).json({ error: 'You are not authorized to delete this game' });
            return;
        }
        // Proceed to delete the game
        await prismaClient_1.default.game.delete({
            where: { id: gameId },
        });
        res.status(200).json({ message: 'Game deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete game' });
    }
};
exports.deleteGame = deleteGame;
// Get all games for the authenticated user
const getAllGames = async (req, res) => {
    const userId = req.user?.userId; // Access the userId from the JWT payload
    if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
    }
    try {
        // Fetch all games for the authenticated user
        const games = await prismaClient_1.default.game.findMany({
            where: {
                userId, // Filter games by the user's ID
            },
        });
        if (games.length === 0) {
            res.status(404).json({ message: 'No games found for this user' });
            return;
        }
        res.status(200).json({ games });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};
exports.getAllGames = getAllGames;
