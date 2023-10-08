-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "emailVerified" BOOLEAN DEFAULT false,
    "accountVerified" BOOLEAN DEFAULT false,
    "email" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "category" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "discount_price" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "admin_status" TEXT NOT NULL DEFAULT 'pending',
    "rating_id" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
