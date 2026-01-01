/*
  Warnings:

  - You are about to drop the column `conditions` on the `MedicalProfile` table. All the data in the column will be lost.
  - The `severityHint` column on the `SymptomCheck` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SeverityHint" AS ENUM ('MILD', 'MODERATE', 'SEVERE');

-- DropIndex
DROP INDEX "Consultation_userId_scheduledAt_idx";

-- DropIndex
DROP INDEX "HealthMetric_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Medication_userId_startDate_idx";

-- DropIndex
DROP INDEX "Notification_userId_scheduledAt_idx";

-- DropIndex
DROP INDEX "SymptomCheck_shouldSeeDoctor_idx";

-- AlterTable
ALTER TABLE "MedicalProfile" DROP COLUMN "conditions";

-- AlterTable
ALTER TABLE "SymptomCheck" ADD COLUMN     "relatedDiseaseId" TEXT,
ALTER COLUMN "likelyConditions" DROP NOT NULL,
DROP COLUMN "severityHint",
ADD COLUMN     "severityHint" "SeverityHint";

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isChronic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDisease" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "diagnosedAt" TIMESTAMP(3),

    CONSTRAINT "UserDisease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDisease_userId_status_idx" ON "UserDisease"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserDisease_userId_diseaseId_key" ON "UserDisease"("userId", "diseaseId");

-- AddForeignKey
ALTER TABLE "UserDisease" ADD CONSTRAINT "UserDisease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDisease" ADD CONSTRAINT "UserDisease_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomCheck" ADD CONSTRAINT "SymptomCheck_relatedDiseaseId_fkey" FOREIGN KEY ("relatedDiseaseId") REFERENCES "Disease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
