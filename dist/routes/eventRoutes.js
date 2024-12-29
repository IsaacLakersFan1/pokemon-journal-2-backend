"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST: Create a new event (Pokémon event)
router.post('/event', authMiddleware_1.authenticateJWT, eventController_1.createEvent);
// GET: Search Pokémon by name (partial search)
router.get('/pokemon/search', authMiddleware_1.authenticateJWT, eventController_1.searchPokemon);
// GET: Get all events
router.get('/events', authMiddleware_1.authenticateJWT, eventController_1.getAllEvents);
// GET: Get events by game ID
router.get('/events/game/:gameId', authMiddleware_1.authenticateJWT, eventController_1.getEventsByGameId);
// Update event status
router.patch('/event/:eventId/status', authMiddleware_1.authenticateJWT, eventController_1.updateEventStatus);
// PUT route for updating isShiny and isChamp
router.put('/events/:eventId/attributes', authMiddleware_1.authenticateJWT, eventController_1.updateEventAttributes);
// PUT route for updating isShiny and isChamp
router.delete('/:eventId/', authMiddleware_1.authenticateJWT, eventController_1.deleteEvent);
exports.default = router;
