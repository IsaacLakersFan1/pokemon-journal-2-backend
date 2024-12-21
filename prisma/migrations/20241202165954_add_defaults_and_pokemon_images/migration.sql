-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN "image" TEXT;
ALTER TABLE "Pokemon" ADD COLUMN "shinyImage" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pokemonId" INTEGER,
    "route" TEXT NOT NULL,
    "nickname" TEXT,
    "status" TEXT,
    "isShiny" INTEGER NOT NULL DEFAULT 0,
    "isChamp" INTEGER NOT NULL DEFAULT 0,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Event_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("gameId", "id", "isChamp", "isShiny", "nickname", "pokemonId", "route", "status") SELECT "gameId", "id", "isChamp", "isShiny", "nickname", "pokemonId", "route", "status" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
