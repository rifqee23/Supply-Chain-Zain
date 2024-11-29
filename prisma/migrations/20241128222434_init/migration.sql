-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STAKEHOLDER', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "StatusRole" AS ENUM ('PENDING', 'ON_PROGRESS', 'SUCCESS', 'REJECT');

-- CreateEnum
CREATE TYPE "ShoePartCategory" AS ENUM ('UPPER', 'SOLE', 'INSOLE', 'SHOELACES', 'HEEL', 'TONGUE', 'EYELETS', 'TOE_CAP', 'QUARTER', 'LINING', 'PADDING');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('METER', 'KG', 'PCS', 'ROLL', 'PACK');

-- CreateTable
CREATE TABLE "Users" (
    "userID" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SUPPLIER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Products" (
    "productID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" "ShoePartCategory" NOT NULL,
    "unit" "UnitType" NOT NULL,
    "material" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("productID")
);

-- CreateTable
CREATE TABLE "Orders" (
    "orderID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "productID" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "StatusRole" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "qr_code" TEXT,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Products_userID_idx" ON "Products"("userID");

-- CreateIndex
CREATE INDEX "Orders_userID_idx" ON "Orders"("userID");

-- CreateIndex
CREATE INDEX "Orders_productID_idx" ON "Orders"("productID");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Products"("productID") ON DELETE RESTRICT ON UPDATE CASCADE;
