import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { error } from 'console';

// Create a new event (register a Pokémon event)
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { pokemonId, route, nickname, status, isShiny, isChamp, gameId, playerId } = req.body;

  try {
    // Create the event in the database
    const newEvent = await prisma.event.create({
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
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};


// Search Pokémon by part of their name
export const searchPokemon = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.searchTerm;

    if (typeof searchTerm === 'string') {
      const pokemons = await prisma.pokemon.findMany({
        where: {
          name: { contains: searchTerm.toLowerCase()  }, // Case-insensitive search
        },
        select: {
          id: true,
          name: true,
          form: true,
          image: true,
        },
      });
      

      res.json(pokemons);
    } else {
      res.status(400).json({ error: 'Invalid search term' });
    }
  } catch (error) {
    console.error('Error searching Pokémon:', error);
    res.status(500).json({ error: 'Failed to search Pokémon' });
  }
};


// Get all events (you can also filter by gameId or other criteria)
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract gameId from query parameters
    const { gameId } = req.query;

    // Build the filter condition
    const whereCondition = gameId ? { gameId: Number(gameId) } : {};

    const events = await prisma.event.findMany({
      where: whereCondition, // Apply the filter if gameId is provided
      include: {
        player: true,
        pokemon: true,
      },
    });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};


// Get events by Game ID
export const getEventsByGameId = async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;

  try {
    const events = await prisma.event.findMany({
      where: { gameId: parseInt(gameId) },
      include: {
        player: true,
        pokemon: true,
      },
    });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events for the game' });
  }
};


export const updateEventStatus = async (req: Request, res: Response): Promise<void> => {
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
    const updatedEvent = await prisma.event.update({
      where: { id: Number(eventId) },
      data: { status },
    });

    res.status(200).json({ message: 'Status updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ error: 'Failed to update event status.' });
  }
};

export const updateEventAttributes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { isShiny, isChamp } = req.body;

    // Validate input
    if (typeof isShiny !== 'number' || typeof isChamp !== 'number') {
      res.status(400).json({ error: "Invalid input. 'isShiny' and 'isChamp' must be numbers." });
      return;
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to update event attributes.',
    });
  }
};

// Delete Event by ID
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params; // Extract eventId from URL parameter

  try {
    // Find the event to ensure it exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: parseInt(eventId) },
    });

    res.status(200).json({ message: 'Event successfully deleted.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'An error occurred while deleting the event.' });
  }
};
