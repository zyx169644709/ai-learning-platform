/*
  Warnings:

  - You are about to drop the column `description` on the `courses` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "course_id" TEXT,
    "chapter_id" TEXT,
    "resource_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "chapters_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chapters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chapters_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chapters" ("author_id", "content", "created_at", "duration", "excerpt", "id", "order", "parent_id", "status", "tags", "title", "type", "updated_at", "video_url", "viewCount") SELECT "author_id", "content", "created_at", "duration", "excerpt", "id", "order", "parent_id", "status", "tags", "title", "type", "updated_at", "video_url", "viewCount" FROM "chapters";
DROP TABLE "chapters";
ALTER TABLE "new_chapters" RENAME TO "chapters";
CREATE INDEX "chapters_parent_id_idx" ON "chapters"("parent_id");
CREATE INDEX "chapters_type_idx" ON "chapters"("type");
CREATE INDEX "chapters_order_idx" ON "chapters"("order");
CREATE INDEX "chapters_status_idx" ON "chapters"("status");
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
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
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("author_id", "content", "cover", "created_at", "duration", "id", "level", "order", "status", "studentCount", "tags", "title", "updated_at", "url", "viewCount") SELECT "author_id", "content", "cover", "created_at", "duration", "id", "level", "order", "status", "studentCount", "tags", "title", "updated_at", "url", "viewCount" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE INDEX "courses_author_id_idx" ON "courses"("author_id");
CREATE INDEX "courses_level_idx" ON "courses"("level");
CREATE INDEX "courses_status_idx" ON "courses"("status");
CREATE INDEX "courses_order_idx" ON "courses"("order");
CREATE TABLE "new_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "resources_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_resources" ("author_id", "cover", "created_at", "description", "icon", "id", "isOfficial", "likeCount", "status", "tags", "title", "type", "updated_at", "url", "viewCount") SELECT "author_id", "cover", "created_at", "description", "icon", "id", "isOfficial", "likeCount", "status", "tags", "title", "type", "updated_at", "url", "viewCount" FROM "resources";
DROP TABLE "resources";
ALTER TABLE "new_resources" RENAME TO "resources";
CREATE INDEX "resources_type_idx" ON "resources"("type");
CREATE INDEX "resources_status_idx" ON "resources"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE INDEX "favorites_target_type_idx" ON "favorites"("target_type");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_target_type_course_id_key" ON "favorites"("user_id", "target_type", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_target_type_chapter_id_key" ON "favorites"("user_id", "target_type", "chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_target_type_resource_id_key" ON "favorites"("user_id", "target_type", "resource_id");
