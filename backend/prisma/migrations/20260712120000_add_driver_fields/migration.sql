/*
  Warnings:

  - A unique constraint covering the columns `[contactNumber]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `drivers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "drivers_contactNumber_key" ON "drivers"("contactNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_email_key" ON "drivers"("email");
