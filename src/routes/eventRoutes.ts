import { Router } from 'express';
import { createEvent, searchPokemon, getAllEvents, getEventsByGameId, updateEventStatus, updateEventAttributes, deleteEvent } from '../controllers/eventController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// POST: Create a new event (Pokémon event)
router.post('/event',authenticateJWT, createEvent);

// GET: Search Pokémon by name (partial search)
router.get('/pokemon/search',authenticateJWT, searchPokemon);

// GET: Get all events
router.get('/events',authenticateJWT, getAllEvents);

// GET: Get events by game ID
router.get('/events/game/:gameId',authenticateJWT, getEventsByGameId);

// Update event status
router.patch('/event/:eventId/status', authenticateJWT, updateEventStatus);

// PUT route for updating isShiny and isChamp
router.put('/events/:eventId/attributes',authenticateJWT, updateEventAttributes);

// PUT route for updating isShiny and isChamp
router.delete('/:eventId/',authenticateJWT, deleteEvent);

export default router;
