// src/types.d.ts

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number; // The type of `userId` that you'll get from the JWT payload
      };
    }
  }
}


// src/types.d.ts

export type PokemonType = 
  | "Bug"
  | "Dark"
  | "Dragon"
  | "Electric"
  | "Fairy"
  | "Fighting"
  | "Fire"
  | "Flying"
  | "Ghost"
  | "Grass"
  | "Ground"
  | "Ice"
  | "Normal"
  | "Poison"
  | "Psychic"
  | "Rock"
  | "Steel"
  | "Water";
