/*
  Warnings:

  - You are about to drop the column `product_id` on the `product_category` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product_image` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `promotion` table. All the data in the column will be lost.
  - You are about to drop the column `app_id` on the `revenue` table. All the data in the column will be lost.
  - The `restricted` column on the `shop` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category_id` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `product_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "restricted" AS ENUM ('no', 'temporary', 'permanent');

-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_productId_fkey";

-- DropForeignKey
ALTER TABLE "promotion" DROP CONSTRAINT "promotion_product_id_fkey";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product_category" DROP COLUMN "product_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_image" DROP COLUMN "productId",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "promotion" DROP COLUMN "product_id";

-- AlterTable
ALTER TABLE "revenue" DROP COLUMN "app_id";

-- AlterTable
ALTER TABLE "shop" DROP COLUMN "restricted",
ADD COLUMN     "restricted" "restricted" NOT NULL DEFAULT 'no';

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
