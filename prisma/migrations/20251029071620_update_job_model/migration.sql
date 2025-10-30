/*
  Warnings:

  - You are about to drop the column `salary` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Job` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "salaryMin" REAL NOT NULL DEFAULT 0.0,
    "salaryMax" REAL NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "company" TEXT NOT NULL DEFAULT 'Rakamin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("createdAt", "description", "id", "location", "requirements", "title", "updatedAt") SELECT "createdAt", "description", "id", "location", "requirements", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
