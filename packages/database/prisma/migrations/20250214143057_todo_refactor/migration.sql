/*
  Warnings:

  - You are about to drop the column `closedAt` on the `TodoItem` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `TodoItem` table. All the data in the column will be lost.
  - You are about to drop the `_TodoItemToTodoLabel` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LabelType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT');

-- DropForeignKey
ALTER TABLE "_TodoItemToTodoLabel" DROP CONSTRAINT "_TodoItemToTodoLabel_A_fkey";

-- DropForeignKey
ALTER TABLE "_TodoItemToTodoLabel" DROP CONSTRAINT "_TodoItemToTodoLabel_B_fkey";

-- AlterTable
ALTER TABLE "TodoItem" DROP COLUMN "closedAt",
DROP COLUMN "state";

-- AlterTable
ALTER TABLE "TodoLabel" ADD COLUMN     "type" "LabelType" NOT NULL DEFAULT 'SELECT';

-- DropTable
DROP TABLE "_TodoItemToTodoLabel";

-- CreateTable
CREATE TABLE "TodoLabelValue" (
    "id" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TodoLabelValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoItemLabelValue" (
    "todoId" TEXT NOT NULL,
    "labelValueId" TEXT NOT NULL,

    CONSTRAINT "TodoItemLabelValue_pkey" PRIMARY KEY ("todoId","labelValueId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoLabelValue_labelId_name_key" ON "TodoLabelValue"("labelId", "name");

-- AddForeignKey
ALTER TABLE "TodoLabelValue" ADD CONSTRAINT "TodoLabelValue_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "TodoLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoItemLabelValue" ADD CONSTRAINT "TodoItemLabelValue_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "TodoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoItemLabelValue" ADD CONSTRAINT "TodoItemLabelValue_labelValueId_fkey" FOREIGN KEY ("labelValueId") REFERENCES "TodoLabelValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
