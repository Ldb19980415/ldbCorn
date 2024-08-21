-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "target" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_title_time_key" ON "Post"("title", "time");
