-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('pending', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "ADMIN_STATUS" AS ENUM ('pending', 'review', 'approved', 'blacklist');

-- CreateEnum
CREATE TYPE "Discount_type" AS ENUM ('Percentage', 'Fixed');

-- CreateEnum
CREATE TYPE "Promo_type" AS ENUM ('Discount');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('active', 'temporary');

-- CreateEnum
CREATE TYPE "shop_status" AS ENUM ('active', 'temporary');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "section_order" TEXT,
    "password" TEXT,
    "provider" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_auth" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "country" TEXT,
    "profile_pic" TEXT,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "VAT" DOUBLE PRECISION,
    "productId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "promo" INTEGER,
    "status" "STATUS" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "category_id" INTEGER,
    "image_id" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "discount_price" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "admin_status" "ADMIN_STATUS" NOT NULL DEFAULT 'pending',
    "rating_id" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_category_id" INTEGER,
    "product_id" TEXT NOT NULL,
    "status" "STATUS" NOT NULL DEFAULT 'pending',

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_product" (
    "id" SERIAL NOT NULL,
    "promo_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "promotion_type" "Promo_type" NOT NULL DEFAULT 'Discount',
    "discount_type" "Discount_type" NOT NULL DEFAULT 'Percentage',
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "product_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "min_cart_price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_promotion" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "type" "Discount_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy_confirmation" BOOLEAN,
    "restricted" TEXT NOT NULL DEFAULT 'no',
    "admin_status" "ADMIN_STATUS" NOT NULL DEFAULT 'pending',
    "is_deleted" "shop_status" NOT NULL DEFAULT 'active',
    "reviewed" BOOLEAN NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_traffic" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_report" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sales" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_id_key" ON "product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_product_id_key" ON "promotion"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_id_key" ON "revenue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "track_promotion_id_key" ON "track_promotion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_id_key" ON "shop"("id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_promotion" ADD CONSTRAINT "track_promotion_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop" ADD CONSTRAINT "shop_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
