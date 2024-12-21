import { Request, Response } from 'express';
import prisma from '../prismaClient';

interface AuthenticatedRequest extends Request {
    user?: {
      userId: number; // The type of `userId` that you'll get from the JWT payload
    };
  }

// Create a relation between a player and a game
export const createPlayerGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { playerId, gameId } = req.body;
  const userId = req.user?.userId;  // Extract userId from the authenticated user

  if (!userId) {
    res.status(400).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Check if the player and game belong to the authenticated user
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    const game = await prisma.game.findUnique({
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
    const newPlayerGame = await prisma.playerGame.create({
      data: {
        playerId,
        gameId,
      },
    });

    res.status(201).json({ message: 'Player linked to game successfully', playerGame: newPlayerGame });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to link player to game' });
  }
};

// Get all players associated with a specific game
export const getPlayersInGame = async (req: Request, res: Response): Promise<void> => {
  const gameId = parseInt(req.params.gameId);

  try {
      const players = await prisma.playerGame.findMany({
          where: { gameId },
          include: {
              player: {
                  include: {
                      pokemon: { // Include related Pokemon details
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
  } catch (error) {
      console.error('Error fetching players for the game:', error);
      res.status(500).json({ error: 'Failed to fetch players for the game' });
  }
};

  