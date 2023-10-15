/*
  Warnings:

  - The primary key for the `order_item` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `promo_id` column on the `order_item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `promotion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `order_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `promo_id` on the `promo_product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `promotion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `promotion_type` on the `promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `promo_id` on the `track_promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "ADMIN_STATUS" ADD VALUE 'suspended';

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_promo_id_fkey";

-- DropForeignKey
ALTER TABLE "promo_product" DROP CONSTRAINT "promo_product_promo_id_fkey";

-- DropForeignKey
ALTER TABLE "track_promotion" DROP CONSTRAINT "track_promotion_promo_id_fkey";

-- AlterTable
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "promo_id",
ADD COLUMN     "promo_id" INTEGER,
ADD CONSTRAINT "order_item_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "promo_product" DROP COLUMN "promo_id",
ADD COLUMN     "promo_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "promotion" DROP CONSTRAINT "promotion_pkey",
ADD COLUMN     "code" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "promotion_type",
ADD COLUMN     "promotion_type" TEXT NOT NULL,
ADD CONSTRAINT "promotion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "track_promotion" DROP COLUMN "promo_id",
ADD COLUMN     "promo_id" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Promo_type";

-- CreateIndex
CREATE UNIQUE INDEX "order_item_id_key" ON "order_item"("id");

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
