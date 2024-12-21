"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utilsController_1 = require("../controllers/utilsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
//Update images of each Pokemon
router.post('/images', authMiddleware_1.authenticateJWT, utilsController_1.updatePokemonImages);
exports.default = router;
