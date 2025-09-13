/*
  Warnings:

  - You are about to drop the `code_snippets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "code_snippets";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "learning_progress";
PRAGMA foreign_keys=on;
