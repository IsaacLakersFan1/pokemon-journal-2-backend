import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import playerRoutes from './routes/playerRoutes';
import playerGameRoutes from './routes/playerGameRoutes';
import pokemonRoutes from './routes/pokemonRoutes';
import eventRoutes from './routes/eventRoutes';
import utilsRoutes from './routes/utilsRoutes';
import path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(
  {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',  // Local development
      'http://i80woc0gwk8owosog8w800w4.193.46.198.43.sslip.io/', // Deployed frontend
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}
));


app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/games', gameRoutes);
app.use('/players', playerRoutes);
app.use('/api', playerGameRoutes);
app.use('/pokemons', pokemonRoutes);
app.use('/events', eventRoutes);
app.use('/utils', utilsRoutes);

// Serve static files from the backend's public folder (including PokemonImages)
app.use("/public", express.static(path.join(__dirname, "../public")));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
