-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_productID_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userID_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_userID_fkey";

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Products"("productID") ON DELETE CASCADE ON UPDATE CASCADE;
