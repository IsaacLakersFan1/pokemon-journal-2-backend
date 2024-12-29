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
        cb(null, path_1.default.join(__dirname, "../../public/PokemonImages")); // Save to "PokemonImages" folder inside public
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
        }
        catch (err) {
            cb(err, "");
        }
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
    // Handle the image upload via multer middleware
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const { nationalDex, name, form, type1, type2, hp, attack, defense, specialAttack, specialDefense, speed, generation, } = req.body;
        // Calculate total points
        const total = parseInt(hp) +
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
            const newPokemon = await prismaClient_1.default.pokemon.create({
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
        }
        catch (error) {
            console.error("Error creating Pokémon:", error);
            res.status(500).json({ error: "Failed to create Pokémon" });
        }
    });
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
        // Calculate type effectiveness
        const typeEffectivenessData = calculateEffectiveness(pokemon.type1, pokemon.type2);
        res.status(200).json({ pokemon, typeEffectiveness: typeEffectivenessData });
    }
    catch (error) {
        console.error('Error fetching Pokémon:', error);
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
            // If a file was uploaded, update the image field (save without extension)
            if (req.file) {
                const imageNameWithoutExtension = path_1.default.basename(req.file.filename, path_1.default.extname(req.file.filename));
                data.image = imageNameWithoutExtension; // Save only the name without the extension
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
// Type Effectiveness Chart
const typeEffectiveness = {
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
// Calculate Effectiveness
const calculateEffectiveness = (type1, type2) => {
    const effectiveness = {};
    Object.keys(typeEffectiveness).forEach((attackingType) => {
        let multiplier = typeEffectiveness[attackingType][type1] || 1;
        if (type2) {
            multiplier *= typeEffectiveness[attackingType][type2] || 1;
        }
        effectiveness[attackingType] = multiplier;
    });
    return effectiveness;
};
