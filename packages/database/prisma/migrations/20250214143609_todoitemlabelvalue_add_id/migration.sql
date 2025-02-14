/*
  Warnings:

  - The primary key for the `TodoItemLabelValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[todoId,labelValueId]` on the table `TodoItemLabelValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `TodoItemLabelValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TodoItemLabelValue" DROP CONSTRAINT "TodoItemLabelValue_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "TodoItemLabelValue_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "TodoItemLabelValue_todoId_labelValueId_key" ON "TodoItemLabelValue"("todoId", "labelValueId");
