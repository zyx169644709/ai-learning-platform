/*
  Warnings:

  - You are about to drop the `course_completions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "course_completions";
PRAGMA foreign_keys=on;
