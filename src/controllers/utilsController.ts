import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const updatePokemonImages = async (req: Request, res: Response) => {
    try {
      // Fetch all Pokémon records
      const pokemons = await prisma.pokemon.findMany();
  
      // Prepare update promises
      const updatePromises = pokemons.map((pokemon) =>
        prisma.pokemon.update({
          where: { id: pokemon.id },
          data: {
            image: (pokemon.name ?? "unknown").toLowerCase(),
            shinyImage: `${(pokemon.name ?? "unknown").toLowerCase()}-shiny`,
          },
        })
      );
  
      // Execute updates
      await Promise.all(updatePromises);
  
      res.status(200).json({ message: "Pokemon images updated successfully!" });
    } catch (error) {
      console.error("Error updating Pokémon images:", error);
      res.status(500).json({ error: "Failed to update Pokémon images." });
    }
  };