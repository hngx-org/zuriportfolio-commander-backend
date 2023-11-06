/*
  Warnings:

  - The values [complete] on the enum `STATUS` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_type` on the `activity` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `promotion` table. All the data in the column will be lost.
  - Added the required column `sub_category_id` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "STATUS_new" AS ENUM ('pending', 'completed', 'failed');
ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order" ALTER COLUMN "status" TYPE "STATUS_new" USING ("status"::text::"STATUS_new");
ALTER TYPE "STATUS" RENAME TO "STATUS_old";
ALTER TYPE "STATUS_new" RENAME TO "STATUS";
DROP TYPE "STATUS_old";
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "activity" DROP COLUMN "user_type";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "sub_category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "promotion" DROP COLUMN "usage";

-- CreateTable
CREATE TABLE "track_promotion" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "promo_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_promotion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "product_sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
