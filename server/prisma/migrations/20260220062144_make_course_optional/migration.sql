-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT,
    "video_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "course_id" TEXT,
    "author_id" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "chapters_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chapters" ("author_id", "content", "course_id", "created_at", "duration", "excerpt", "id", "order", "status", "tags", "title", "updated_at", "video_url", "viewCount") SELECT "author_id", "content", "course_id", "created_at", "duration", "excerpt", "id", "order", "status", "tags", "title", "updated_at", "video_url", "viewCount" FROM "chapters";
DROP TABLE "chapters";
ALTER TABLE "new_chapters" RENAME TO "chapters";
CREATE INDEX "chapters_course_id_idx" ON "chapters"("course_id");
CREATE INDEX "chapters_order_idx" ON "chapters"("order");
CREATE INDEX "chapters_status_idx" ON "chapters"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
