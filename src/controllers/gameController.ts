import { Request, Response } from 'express';
import prisma from '../prismaClient';

interface AuthenticatedRequest extends Request {
    user?: {
      userId: number; // The type of `userId` that you'll get from the JWT payload
    };
  }

// Create a new game
export const createGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, playerCount } = req.body;
  const userId = req.user?.userId;  // Access the userId from the JWT payload

  if (!userId) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const newGame = await prisma.game.create({
      data: {
        name,
        playerCount,
        userId,  // Associate the game with the authenticated user
      },
    });

    res.status(201).json({ message: 'Game created successfully', game: newGame });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// Delete a game by ID
export const deleteGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const gameId = parseInt(req.params.id);
  const userId = req.user?.userId;  // Access the userId from the JWT payload

  if (!userId) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Check if the game exists and is associated with the user
    const game = await prisma.game.findUnique({
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
    await prisma.game.delete({
      where: { id: gameId },
    });

    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
};


// Get all games for the authenticated user
export const getAllGames = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;  // Access the userId from the JWT payload

  if (!userId) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Fetch all games for the authenticated user
    const games = await prisma.game.findMany({
      where: {
        userId,  // Filter games by the user's ID
      },
    });

    if (games.length === 0) {
      res.status(404).json({ message: 'No games found for this user' });
      return;
    }

    res.status(200).json({ games });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};
