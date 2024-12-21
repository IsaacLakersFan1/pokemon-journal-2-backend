/*
  Warnings:

  - A unique constraint covering the columns `[playerId,gameId]` on the table `PlayerGame` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlayerGame_playerId_gameId_key" ON "PlayerGame"("playerId", "gameId");
