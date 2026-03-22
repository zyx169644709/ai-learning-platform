-- CreateTable
CREATE TABLE "section_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "section_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "section_completions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "chapters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "section_completions_user_id_idx" ON "section_completions"("user_id");

-- CreateIndex
CREATE INDEX "section_completions_section_id_idx" ON "section_completions"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "section_completions_user_id_section_id_key" ON "section_completions"("user_id", "section_id");
