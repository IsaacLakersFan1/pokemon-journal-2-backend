import { Request, Response } from 'express';
import prisma from '../prismaClient';
import multer from "multer";
import path from "path";


// Set up Multer storage (save images to "public" folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/PokemonImages")); // Save to "PokemonImages" folder inside public
  },
  filename: (req, file, cb) => {
    try {
      const { name, form } = req.body; // Access Pokémon name and form from the request body
      if (!name) {
        return cb(new Error("Pokémon name is required for naming the file"), "");
      }

      // Normalize the Pokémon name
      let lowerCaseName = name.toLowerCase().replace(/\s+/g, "-"); // Convert name to lowercase and replace spaces with dashes

      // If form includes "Mega" or "mega," prefix the name with "mega-"
      if (form && /mega/i.test(form)) {
        lowerCaseName = `mega-${lowerCaseName}`;
      }

      cb(null, `${lowerCaseName}.png`); // Save file as 'name.png'
    } catch (err: any) {
      cb(err, "");
    }
  },
});

// Validate file type (only PNG)
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG files are allowed!"), false);
  }
};

// Multer middleware
const upload = multer({ storage, fileFilter });

// Create a new Pokémon
export const createPokemon = async (req: Request, res: Response): Promise<void> => {
  // Handle the image upload via multer middleware
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const {
      nationalDex,
      name,
      form,
      type1,
      type2,
      hp,
      attack,
      defense,
      specialAttack,
      specialDefense,
      speed,
      generation,
    } = req.body;

    // Calculate total points
    const total =
      parseInt(hp) +
      parseInt(attack) +
      parseInt(defense) +
      parseInt(specialAttack) +
      parseInt(specialDefense) +
      parseInt(speed);

    try {
      // Normalize the Pokémon name
      let lowerCaseName = name.toLowerCase().replace(/\s+/g, "-"); // Replace spaces with dashes

      // If form includes "Mega" or "mega," prefix the name with "mega-"
      if (form && /mega/i.test(form)) {
        lowerCaseName = `mega-${lowerCaseName}`;
      }

      // Use the normalized name for image and shiny image
      const image = lowerCaseName;
      const shinyImage = `${lowerCaseName}-shiny`;

      // Create Pokémon record in the DB
      const newPokemon = await prisma.pokemon.create({
        data: {
          nationalDex: parseInt(nationalDex),
          name,
          form,
          type1,
          type2,
          total,
          hp: parseInt(hp),
          attack: parseInt(attack),
          defense: parseInt(defense),
          specialAttack: parseInt(specialAttack),
          specialDefense: parseInt(specialDefense),
          speed: parseInt(speed),
          generation: parseInt(generation),
          image,
          shinyImage,
        },
      });

      res
        .status(201)
        .json({ message: "Pokémon created successfully", pokemon: newPokemon });
    } catch (error) {
      console.error("Error creating Pokémon:", error);
      res.status(500).json({ error: "Failed to create Pokémon" });
    }
  });
};



// Get all Pokémon
export const getAllPokemon = async (req: Request, res: Response): Promise<void> => {
  try {
    const pokemons = await prisma.pokemon.findMany();
    res.status(200).json({ pokemons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pokémon' });
  }
};

// Get a Pokémon by ID
export const getPokemonById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pokemon) {
      res.status(404).json({ error: 'Pokémon not found' });
      return;
    }

    // Calculate type effectiveness
    const typeEffectivenessData = calculateEffectiveness(pokemon.type1, pokemon.type2);

    res.status(200).json({ pokemon, typeEffectiveness: typeEffectivenessData });
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    res.status(500).json({ error: 'Failed to fetch Pokémon' });
  }
};

// Updated endpoint to handle image uploads and Pokémon updates
export const updatePokemon = async (req: Request, res: Response): Promise<void> => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { id } = req.params;
    const {
      name,
      form,
      type1,
      type2,
      total,
      hp,
      attack,
      defense,
      specialAttack,
      specialDefense,
      speed,
      generation,
    } = req.body;

    try {
      const data: any = {
        name,
        form,
        type1,
        type2,
        total: parseInt(total),
        hp: parseInt(hp),
        attack: parseInt(attack),
        defense: parseInt(defense),
        specialAttack: parseInt(specialAttack),
        specialDefense: parseInt(specialDefense),
        speed: parseInt(speed),
        generation: parseInt(generation),
      };

      // If a file was uploaded, update the image field (save without extension)
      if (req.file) {
        const imageNameWithoutExtension = path.basename(req.file.filename, path.extname(req.file.filename));
        data.image = imageNameWithoutExtension; // Save only the name without the extension
      }

      const updatedPokemon = await prisma.pokemon.update({
        where: { id: parseInt(id) },
        data,
      });

      res.status(200).json({ message: "Pokémon updated successfully", pokemon: updatedPokemon });
    } catch (error) {
      console.error("Error updating Pokémon:", error);
      res.status(500).json({ error: "Failed to update Pokémon" });
    }
  });
};


// Delete a Pokémon by ID
export const deletePokemon = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedPokemon = await prisma.pokemon.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Pokémon deleted successfully', pokemon: deletedPokemon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Pokémon' });
  }
};


// Type Effectiveness Chart
const typeEffectiveness: { [key: string]: { [key: string]: number } } = {
  Normal: { Rock: 0.5, Steel: 0.5, Ghost: 0 },
  Fire: { Grass: 2, Ice: 2, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5 },
  Water: { Fire: 2, Ground: 2, Rock: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
  Grass: {
    Water: 2,
    Ground: 2,
    Rock: 2,
    Fire: 0.5,
    Grass: 0.5,
    Poison: 0.5,
    Flying: 0.5,
    Bug: 0.5,
    Dragon: 0.5,
    Steel: 0.5,
  },
  Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0 },
  Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Fairy: 0.5, Ghost: 0 },
  Poison: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground: { Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0 },
  Flying: { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug: { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ghost: { Psychic: 2, Ghost: 2, Dark: 0.5, Normal: 0 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
  Fairy: { Fighting: 2, Dragon: 2, Dark: 2, Fire: 0.5, Poison: 0.5, Steel: 0.5 },
};

const calculateEffectiveness = (type1: string, type2?: string | null) => {
  const effectiveness: { [key: string]: number } = {};

  Object.keys(typeEffectiveness).forEach((attackingType) => {
    let multiplier = typeEffectiveness[attackingType][type1] || 1;

    if (type2) {
      multiplier *= typeEffectiveness[attackingType][type2] || 1;
    }

    effectiveness[attackingType] = multiplier;
  });

  return effectiveness;
};
