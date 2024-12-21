import { Router } from 'express';
import { updatePokemonImages } from '../controllers/utilsController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

//Update images of each Pokemon
router.post('/images',authenticateJWT, updatePokemonImages);

export default router;
