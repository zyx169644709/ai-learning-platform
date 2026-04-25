-- RedefineTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quiz_id" TEXT NOT NULL,
    "question_type" TEXT NOT NULL DEFAULT 'single',
    "content" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" JSONB NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_questions" (
  "id",
  "quiz_id",
  "question_type",
  "content",
  "options",
  "correct_answer",
  "explanation",
  "order",
  "created_at",
  "updated_at"
)
SELECT
  "id",
  "quiz_id",
  'single' AS "question_type",
  "content",
  "options",
  json_array("correct_answer") AS "correct_answer",
  "explanation",
  "order",
  "created_at",
  "updated_at"
FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE INDEX "questions_quiz_id_idx" ON "questions"("quiz_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
