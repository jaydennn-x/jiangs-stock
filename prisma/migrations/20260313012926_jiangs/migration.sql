/*
  Warnings:

  - You are about to drop the column `search_vector` on the `Image` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_image_color_tags";

-- DropIndex
DROP INDEX "idx_image_search_vector";

-- DropIndex
DROP INDEX "idx_image_tags";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "search_vector";
