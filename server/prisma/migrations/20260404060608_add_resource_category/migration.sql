-- AlterTable
ALTER TABLE "resources" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");
