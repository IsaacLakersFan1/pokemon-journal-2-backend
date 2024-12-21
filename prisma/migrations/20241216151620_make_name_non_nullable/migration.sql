/*
  Warnings:

  - Made the column `name` on table `Pokemon` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nationalDex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "form" TEXT,
    "type1" TEXT NOT NULL,
    "type2" TEXT,
    "total" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "specialAttack" INTEGER NOT NULL,
    "specialDefense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "generation" INTEGER NOT NULL,
    "image" TEXT,
    "shinyImage" TEXT
);
INSERT INTO "new_Pokemon" ("attack", "defense", "form", "generation", "hp", "id", "image", "name", "nationalDex", "shinyImage", "specialAttack", "specialDefense", "speed", "total", "type1", "type2") SELECT "attack", "defense", "form", "generation", "hp", "id", "image", "name", "nationalDex", "shinyImage", "specialAttack", "specialDefense", "speed", "total", "type1", "type2" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
