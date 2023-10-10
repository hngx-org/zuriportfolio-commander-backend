-- DropForeignKey
ALTER TABLE "promotion" DROP CONSTRAINT "promotion_product_id_fkey";

-- AlterTable
ALTER TABLE "promotion" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "min_cart_price" DROP NOT NULL,
ALTER COLUMN "min_cart_price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "shop" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "reviewed" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
