"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pokemonController_1 = require("../controllers/pokemonController");
const router = (0, express_1.Router)();
// POST: Create a new Pokémon
router.post('/pokemon', pokemonController_1.createPokemon);
// GET: Get all Pokémon
router.get('/pokemon', pokemonController_1.getAllPokemon);
// GET: Get Pokémon by ID
router.get('/pokemon/:id', pokemonController_1.getPokemonById);
// PUT: Update Pokémon by ID
router.put('/pokemon/:id', pokemonController_1.updatePokemon);
// DELETE: Delete Pokémon by ID
router.delete('/pokemon/:id', pokemonController_1.deletePokemon);
exports.default = router;
