-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,
    "cover" TEXT,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "duration" TEXT,
    "content" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("author_id", "content", "cover", "created_at", "description", "duration", "id", "level", "status", "studentCount", "tags", "title", "updated_at", "url", "viewCount") SELECT "author_id", "content", "cover", "created_at", "description", "duration", "id", "level", "status", "studentCount", "tags", "title", "updated_at", "url", "viewCount" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE INDEX "courses_author_id_idx" ON "courses"("author_id");
CREATE INDEX "courses_level_idx" ON "courses"("level");
CREATE INDEX "courses_status_idx" ON "courses"("status");
CREATE INDEX "courses_order_idx" ON "courses"("order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
