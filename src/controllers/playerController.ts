// src/controllers/playerController.ts
import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { PokemonType } from '../types'; // Import the PokemonType type

interface AuthenticatedRequest extends Request {
    user?: {
      userId: number; // The type of `userId` that you'll get from the JWT payload
    };
  }

  interface PokemonStat {
    timesCaptured: number;
    shinyCapture: string;
  }

  // Type Guard for Pokemon Type
function isValidPokemonType(type: string): type is PokemonType {
  const validTypes: PokemonType[] = [
    "Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying",
    "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"
  ];
  return validTypes.includes(type as PokemonType);
}


// Create a new player
export const createPlayer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, pokemonId } = req.body;
    const userId = req.user?.userId;  // Extract userId from the authenticated user
  
    if (!userId) {
      res.status(400).json({ error: 'User not authenticated' });
      return;
    }
  
    try {
      const newPlayer = await prisma.player.create({
        data: {
          name,
          pokemonId,
          userId,  // Associate player with authenticated user
        },
      });
  
      res.status(201).json({ message: 'Player created successfully', player: newPlayer });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to create player' });
    }
  };
  

// Update a player's information
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
  const playerId = parseInt(req.params.id);
  const { name, pokemonId } = req.body;

  try {
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { name, pokemonId },
    });

    res.status(200).json({ message: 'Player updated successfully', player: updatedPlayer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
};

// Delete a player by ID
export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  const playerId = parseInt(req.params.id);

  try {
    await prisma.player.delete({
      where: { id: playerId },
    });

    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
};

// Get all players for the authenticated user
export const getPlayers = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Fetch players with related Pokémon data
    const players = await prisma.player.findMany({
      where: { userId },
      include: {
        pokemon: true,  // Include the related Pokémon data
      },
    });

    // Return players along with Pokémon information
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

// Trainer Stats Endpoint
export const getTrainerStats = async (req: Request, res: Response): Promise<void> => {
  const { playerId } = req.params;
  const { gameId } = req.query; // Optional gameId to filter by game

  try {
    // Fetch player data (including name and Pokémon details) and events, optionally filtered by gameId
    const player = await prisma.player.findUnique({
      where: { id: parseInt(playerId) },
      include: {
        pokemon: true, // Include Pokémon data related to the player
      },
    });

    // If player not found, return an error
    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    // Fetch player events, optionally filter by gameId
    const events = await prisma.event.findMany({
      where: {
        playerId: parseInt(playerId),
        ...(gameId ? { gameId: parseInt(gameId as string) } : {}),
      },
      include: {
        pokemon: true, // Include Pokémon data for type analysis
      },
    });

    // Initialize stats object
    const stats = {
      playerName: player.name, // Add player name
      pokemon: player.pokemon, // Add player's Pokémon data
      caught: 0,
      runaway: 0,
      defeated: 0,
      shiny: 0,
      typeCounts: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 0,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 0,
        Steel: 0,
        Water: 0,
      },
    };

    // Iterate over events and calculate stats
    events.forEach((event) => {
      // Count statuses
      if (event.status === 'Catched') stats.caught++;
      if (event.status === 'Run Away') stats.runaway++;
      if (event.status === 'Defeated') stats.defeated++;

      // Count shinies
      if (event.isShiny === 1) stats.shiny++;

      // Count Pokémon types (both type1 and type2)
      if (event.pokemon) {
        const { type1, type2 } = event.pokemon;

        if (type1 && isValidPokemonType(type1)) {
          stats.typeCounts[type1 as PokemonType] = (stats.typeCounts[type1 as PokemonType] || 0) + 1;
        }

        if (type2 && isValidPokemonType(type2)) {
          stats.typeCounts[type2 as PokemonType] = (stats.typeCounts[type2 as PokemonType] || 0) + 1;
        }
      }
    });

    // Respond with the calculated stats and player information
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching trainer stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Trainer Stats by Pokémon
export const getPokemonsStats = async (req: Request, res: Response): Promise<void> => {
  const playerId = parseInt(req.params.playerId); // Get playerId from URL parameter

  try {
    // Fetch all Pokémon with their events (and shiny status) for the given playerId
    const pokemons = await prisma.pokemon.findMany({
      include: {
        events: {
          where: {
            playerId: playerId, // Only include events for the given playerId
          },
          select: {
            isShiny: true, // Select shiny status
          },
        },
      },
    });

    // Map the Pokémon data to an array of objects
    const pokemonStats = pokemons.map((pokemon) => {
      const timesCaptured = pokemon.events.length;
      const shinyCapture = pokemon.events.some(event => event.isShiny === 1) ? 'yes' : 'no';

      return {
        id: pokemon.id,
        type1: pokemon.type1,
        type2: pokemon.type2,
        name: pokemon.name,
        form: pokemon.form,
        timesCaptured,
        shinyCapture,
        image: pokemon.image || null, // Regular image URL
        shinyImage: pokemon.shinyImage || null, // Shiny image URL
      };
    });

    // Send the result as a JSON response
    res.json(pokemonStats);
  } catch (error) {
    console.error('Error fetching Pokémon stats:', error);
    res.status(500).json({ message: 'An error occurred while fetching Pokémon stats.' });
  }
};









export default getTrainerStats;