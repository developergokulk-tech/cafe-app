/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Dish` table. All the data in the column will be lost.
  - You are about to drop the column `foodType` on the `Dish` table. All the data in the column will be lost.
  - Added the required column `dietary` to the `Dish` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "createdAt",
DROP COLUMN "foodType",
ADD COLUMN     "calories" TEXT,
ADD COLUMN     "dietary" TEXT NOT NULL,
ADD COLUMN     "hasCustomization" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isBestseller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSpooky" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "prepTime" TEXT;
