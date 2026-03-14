/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_categoryId_fkey";

-- DropIndex
DROP INDEX "Image_categoryId_isActive_idx";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";

-- CreateIndex
CREATE INDEX "Image_isActive_idx" ON "Image"("isActive");
