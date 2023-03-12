/*
  Warnings:

  - Added the required column `playedAt` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Player_password_key";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "playedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "betting_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchId" INTEGER,
ALTER COLUMN "case_ticket" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "betAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
