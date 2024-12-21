"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventAttributes = exports.updateEventStatus = exports.getEventsByGameId = exports.getAllEvents = exports.searchPokemon = exports.createEvent = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
// Create a new event (register a Pokémon event)
const createEvent = async (req, res) => {
    const { pokemonId, route, nickname, status, isShiny, isChamp, gameId, playerId } = req.body;
    try {
        // Create the event in the database
        const newEvent = await prismaClient_1.default.event.create({
            data: {
                pokemonId,
                route,
                nickname,
                status: status || 'Catched', // Default to 'Catched' if not provided
                isShiny,
                isChamp,
                gameId,
                playerId, // Directly associate the event with a player
            },
            include: {
                player: true, // Include player details in the response
                pokemon: true, // Include Pokémon details in the response
            },
        });
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};
exports.createEvent = createEvent;
// Search Pokémon by part of their name
const searchPokemon = async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm;
        if (typeof searchTerm === 'string') {
            const pokemons = await prismaClient_1.default.pokemon.findMany({
                where: {
                    name: { contains: searchTerm.toLowerCase() }, // Case-insensitive search
                },
                select: {
                    id: true,
                    name: true,
                    form: true,
                    image: true,
                },
            });
            res.json(pokemons);
        }
        else {
            res.status(400).json({ error: 'Invalid search term' });
        }
    }
    catch (error) {
        console.error('Error searching Pokémon:', error);
        res.status(500).json({ error: 'Failed to search Pokémon' });
    }
};
exports.searchPokemon = searchPokemon;
// Get all events (you can also filter by gameId or other criteria)
const getAllEvents = async (req, res) => {
    try {
        // Extract gameId from query parameters
        const { gameId } = req.query;
        // Build the filter condition
        const whereCondition = gameId ? { gameId: Number(gameId) } : {};
        const events = await prismaClient_1.default.event.findMany({
            where: whereCondition, // Apply the filter if gameId is provided
            include: {
                player: true,
                pokemon: true,
            },
        });
        res.status(200).json({ events });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};
exports.getAllEvents = getAllEvents;
// Get events by Game ID
const getEventsByGameId = async (req, res) => {
    const { gameId } = req.params;
    try {
        const events = await prismaClient_1.default.event.findMany({
            where: { gameId: parseInt(gameId) },
            include: {
                player: true,
                pokemon: true,
            },
        });
        res.status(200).json({ events });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch events for the game' });
    }
};
exports.getEventsByGameId = getEventsByGameId;
const updateEventStatus = async (req, res) => {
    const { eventId } = req.params;
    const { status } = req.body;
    // Validate input
    const validStatuses = ['Catched', 'Run Away', 'Defeated'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status provided.' });
        return; // Ensure early return
    }
    try {
        // Update event status
        const updatedEvent = await prismaClient_1.default.event.update({
            where: { id: Number(eventId) },
            data: { status },
        });
        res.status(200).json({ message: 'Status updated successfully', event: updatedEvent });
    }
    catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ error: 'Failed to update event status.' });
    }
};
exports.updateEventStatus = updateEventStatus;
const updateEventAttributes = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { isShiny, isChamp } = req.body;
        // Validate input
        if (typeof isShiny !== 'number' || typeof isChamp !== 'number') {
            res.status(400).json({ error: "Invalid input. 'isShiny' and 'isChamp' must be numbers." });
            return;
        }
        // Update the event
        const updatedEvent = await prismaClient_1.default.event.update({
            where: { id: Number(eventId) },
            data: {
                isShiny,
                isChamp
            },
        });
        res.status(200).json({
            message: 'Event attributes updated successfully',
            event: updatedEvent,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to update event attributes.',
        });
    }
};
exports.updateEventAttributes = updateEventAttributes;
