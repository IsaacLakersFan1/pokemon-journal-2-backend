"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePokemon = exports.updatePokemon = exports.getPokemonById = exports.getAllPokemon = exports.createPokemon = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Set up Multer storage (save images to "public" folder)
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../public")); // Save to "public" folder
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname); // Get file extension
        cb(null, `${Date.now()}-${file.fieldname}${ext}`); // Generate unique filename
    },
});
// Validate file type (only PNG)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png") {
        cb(null, true);
    }
    else {
        cb(new Error("Only PNG files are allowed!"), false);
    }
};
// Multer middleware
const upload = (0, multer_1.default)({ storage, fileFilter });
// Create a new Pokémon
const createPokemon = async (req, res) => {
    const { nationalDex, name, form, type1, type2, total, hp, attack, defense, specialAttack, specialDefense, speed, generation } = req.body;
    try {
        // Generate the image and shinyImage fields based on the name
        const lowerCaseName = name.toLowerCase();
        const image = lowerCaseName;
        const shinyImage = `${lowerCaseName}-shiny`;
        // Create Pokémon with the generated image fields
        const newPokemon = await prismaClient_1.default.pokemon.create({
            data: {
                nationalDex,
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
                image, // Auto-filled field
                shinyImage, // Auto-filled field
            },
        });
        res.status(201).json({ message: 'Pokémon created successfully', pokemon: newPokemon });
    }
    catch (error) {
        console.error("Error creating Pokémon:", error);
        res.status(500).json({ error: 'Failed to create Pokémon' });
    }
};
exports.createPokemon = createPokemon;
// Get all Pokémon
const getAllPokemon = async (req, res) => {
    try {
        const pokemons = await prismaClient_1.default.pokemon.findMany();
        res.status(200).json({ pokemons });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokémon' });
    }
};
exports.getAllPokemon = getAllPokemon;
// Get a Pokémon by ID
const getPokemonById = async (req, res) => {
    const { id } = req.params;
    try {
        const pokemon = await prismaClient_1.default.pokemon.findUnique({
            where: { id: parseInt(id) },
        });
        if (!pokemon) {
            res.status(404).json({ error: 'Pokémon not found' });
            return;
        }
        res.status(200).json({ pokemon });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokémon' });
    }
};
exports.getPokemonById = getPokemonById;
// Updated endpoint to handle image uploads and Pokémon updates
const updatePokemon = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const { id } = req.params;
        const { name, form, type1, type2, total, hp, attack, defense, specialAttack, specialDefense, speed, generation, } = req.body;
        try {
            const data = {
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
            // If a file was uploaded, update the image field
            if (req.file) {
                data.image = req.file.filename; // Save the image filename to DB
            }
            const updatedPokemon = await prismaClient_1.default.pokemon.update({
                where: { id: parseInt(id) },
                data,
            });
            res.status(200).json({ message: "Pokémon updated successfully", pokemon: updatedPokemon });
        }
        catch (error) {
            console.error("Error updating Pokémon:", error);
            res.status(500).json({ error: "Failed to update Pokémon" });
        }
    });
};
exports.updatePokemon = updatePokemon;
// Delete a Pokémon by ID
const deletePokemon = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPokemon = await prismaClient_1.default.pokemon.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: 'Pokémon deleted successfully', pokemon: deletedPokemon });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete Pokémon' });
    }
};
exports.deletePokemon = deletePokemon;
