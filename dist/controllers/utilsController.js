"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePokemonImages = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const updatePokemonImages = async (req, res) => {
    try {
        // Fetch all Pokémon records
        const pokemons = await prismaClient_1.default.pokemon.findMany();
        // Prepare update promises
        const updatePromises = pokemons.map((pokemon) => prismaClient_1.default.pokemon.update({
            where: { id: pokemon.id },
            data: {
                image: (pokemon.name ?? "unknown").toLowerCase(),
                shinyImage: `${(pokemon.name ?? "unknown").toLowerCase()}-shiny`,
            },
        }));
        // Execute updates
        await Promise.all(updatePromises);
        res.status(200).json({ message: "Pokemon images updated successfully!" });
    }
    catch (error) {
        console.error("Error updating Pokémon images:", error);
        res.status(500).json({ error: "Failed to update Pokémon images." });
    }
};
exports.updatePokemonImages = updatePokemonImages;
