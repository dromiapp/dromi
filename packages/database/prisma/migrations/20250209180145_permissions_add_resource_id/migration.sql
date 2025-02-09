/*
  Warnings:

  - A unique constraint covering the columns `[memberId,resource,resourceId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Permission_memberId_resource_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "resourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_memberId_resource_resourceId_key" ON "Permission"("memberId", "resource", "resourceId");
