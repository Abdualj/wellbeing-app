/*
  Warnings:

  - Made the column `groupId` on table `memberships` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'GROUP');

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "groupId" SET NOT NULL;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT 'GROUP',
ALTER COLUMN "groupId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "posts_visibility_idx" ON "posts"("visibility");
