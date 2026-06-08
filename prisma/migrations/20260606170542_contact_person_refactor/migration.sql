/*
  Warnings:

  - You are about to drop the `ContactChannel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ContactChannel";

-- DropEnum
DROP TYPE "ContactType";

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone1" TEXT NOT NULL,
    "phone1OnWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "phone2" TEXT,
    "phone2OnWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactPerson_isActive_order_idx" ON "ContactPerson"("isActive", "order");
