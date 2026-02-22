/*
  Warnings:

  - You are about to drop the column `course_id` on the `chapters` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "type" TEXT NOT NULL DEFAULT 'section',
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT,
    "video_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "parent_id" TEXT,
    "author_id" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "chapters_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chapters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chapters_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chapters" ("author_id", "content", "created_at", "duration", "excerpt", "id", "order", "status", "tags", "title", "updated_at", "video_url", "viewCount") SELECT "author_id", "content", "created_at", "duration", "excerpt", "id", "order", "status", "tags", "title", "updated_at", "video_url", "viewCount" FROM "chapters";
DROP TABLE "chapters";
ALTER TABLE "new_chapters" RENAME TO "chapters";
CREATE INDEX "chapters_parent_id_idx" ON "chapters"("parent_id");
CREATE INDEX "chapters_type_idx" ON "chapters"("type");
CREATE INDEX "chapters_order_idx" ON "chapters"("order");
CREATE INDEX "chapters_status_idx" ON "chapters"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
