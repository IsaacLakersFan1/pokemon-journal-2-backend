"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const playerGameRoutes_1 = __importDefault(require("./routes/playerGameRoutes"));
const pokemonRoutes_1 = __importDefault(require("./routes/pokemonRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const utilsRoutes_1 = __importDefault(require("./routes/utilsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Routes
app.use('/auth', authRoutes_1.default);
app.use('/games', gameRoutes_1.default);
app.use('/players', playerRoutes_1.default);
app.use('/api', playerGameRoutes_1.default);
app.use('/pokemons', pokemonRoutes_1.default);
app.use('/events', eventRoutes_1.default);
app.use('/utils', utilsRoutes_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
