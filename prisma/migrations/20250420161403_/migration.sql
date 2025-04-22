/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `emailAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailAuthorized` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "BillDetail" DROP CONSTRAINT "BillDetail_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvitationToken" DROP CONSTRAINT "InvitationToken_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "flatmate_invitations" DROP CONSTRAINT "flatmate_invitations_owner_id_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "refresh_token_expires_in" INTEGER,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "ownerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BillDetail" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "InvitationToken" ALTER COLUMN "ownerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "emailAccessToken",
DROP COLUMN "emailAuthorized",
DROP COLUMN "emailProvider",
DROP COLUMN "emailRefreshToken",
DROP COLUMN "emailTokenExpiry",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "ownerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "flatmate_invitations" ALTER COLUMN "owner_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationToken" ADD CONSTRAINT "InvitationToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flatmate_invitations" ADD CONSTRAINT "flatmate_invitations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillDetail" ADD CONSTRAINT "BillDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
