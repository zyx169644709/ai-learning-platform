/*
  Warnings:

  - You are about to drop the column `author` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorAvatar` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `discussions` table. All the data in the column will be lost.
  - You are about to drop the column `authorAvatar` on the `discussions` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `discussions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("content", "created_at", "discussion_id", "id", "likes", "updated_at") SELECT "content", "created_at", "discussion_id", "id", "likes", "updated_at" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_discussions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "discussions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_discussions" ("category", "content", "created_at", "excerpt", "id", "likes", "title", "updated_at", "views") SELECT "category", "content", "created_at", "excerpt", "id", "likes", "title", "updated_at", "views" FROM "discussions";
DROP TABLE "discussions";
ALTER TABLE "new_discussions" RENAME TO "discussions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
