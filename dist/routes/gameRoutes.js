"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gameController_1 = require("../controllers/gameController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import the JWT middleware
const router = express_1.default.Router();
// Apply authenticateJWT middleware to game routes that require authentication
router.get('/games', authMiddleware_1.authenticateJWT, gameController_1.getAllGames);
router.post('/', authMiddleware_1.authenticateJWT, gameController_1.createGame); // Create game
router.delete('/:id', authMiddleware_1.authenticateJWT, gameController_1.deleteGame); // Delete game
exports.default = router;
