-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('pending', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "ADMIN_STATUS" AS ENUM ('pending', 'approved', 'reviewed', 'blacklisted', 'suspended');

-- CreateEnum
CREATE TYPE "Discount_type" AS ENUM ('Percentage', 'Fixed');

-- CreateEnum
CREATE TYPE "restricted" AS ENUM ('no', 'temporary', 'permanent');

-- CreateEnum
CREATE TYPE "ACTIVITY_USER_TYPE" AS ENUM ('admin', 'merchant');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('active', 'temporary');

-- CreateEnum
CREATE TYPE "shop_status" AS ENUM ('active', 'temporary');

-- CreateEnum
CREATE TYPE "ORDER_STATUS" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PRODUCT_ASSET_TYPE" AS ENUM ('internal', 'external');

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
    "refresh_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "VAT" DOUBLE PRECISION,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "STATUS" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_price" DOUBLE PRECISION NOT NULL,
    "order_VAT" DOUBLE PRECISION NOT NULL,
    "order_discount" DOUBLE PRECISION NOT NULL,
    "status" "ORDER_STATUS" NOT NULL DEFAULT 'pending',
    "promo_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "discount_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL,
    "admin_status" "ADMIN_STATUS" NOT NULL DEFAULT 'pending',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" "product_status" NOT NULL DEFAULT 'active',
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_digital_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "type" "PRODUCT_ASSET_TYPE" NOT NULL DEFAULT 'external',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "product_digital_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sub_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_category_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_product" (
    "id" SERIAL NOT NULL,
    "promo_id" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "promo_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "promotion_type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "Discount_type" NOT NULL DEFAULT 'Percentage',
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "maximum_discount_price" DOUBLE PRECISION,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP NOT NULL,
    "valid_to" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy_confirmation" BOOLEAN,
    "restricted" "restricted" NOT NULL DEFAULT 'no',
    "admin_status" "ADMIN_STATUS" NOT NULL DEFAULT 'pending',
    "is_deleted" "shop_status" NOT NULL DEFAULT 'active',
    "reviewed" BOOLEAN,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_traffic" (
    "id" SERIAL NOT NULL,
    "shop_id" TEXT NOT NULL,
    "ip_addr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_report" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sales" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_type" "ACTIVITY_USER_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_id_key" ON "order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_id_key" ON "order_item"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_id_key" ON "product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_digital_assets_id_key" ON "product_digital_assets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_digital_assets_product_id_key" ON "product_digital_assets"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_name_key" ON "product_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_sub_category_name_key" ON "product_sub_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_id_key" ON "revenue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_id_key" ON "shop"("id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_digital_assets" ADD CONSTRAINT "product_digital_assets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sub_category" ADD CONSTRAINT "product_sub_category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product" ADD CONSTRAINT "promo_product_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop" ADD CONSTRAINT "shop_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_report" ADD CONSTRAINT "sales_report_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
