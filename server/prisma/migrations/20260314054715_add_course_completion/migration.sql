-- CreateTable
CREATE TABLE "course_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "course_completions_user_id_idx" ON "course_completions"("user_id");

-- CreateIndex
CREATE INDEX "course_completions_course_id_idx" ON "course_completions"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_completions_user_id_course_id_key" ON "course_completions"("user_id", "course_id");
