/*
  Warnings:

  - You are about to drop the column `firstName` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `Candidate` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATETIME,
    "gender" TEXT,
    "domicile" TEXT,
    "phone_number" TEXT,
    "email" TEXT NOT NULL,
    "linkedin_link" TEXT,
    "photo_profile" TEXT,
    "jobId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("createdAt", "email", "id", "jobId", "updatedAt") SELECT "createdAt", "email", "id", "jobId", "updatedAt" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
