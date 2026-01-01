/*
  Warnings:

  - You are about to drop the column `birthDate` on the `MedicalProfile` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `MedicalProfile` table. All the data in the column will be lost.
  - The `schedule` column on the `Medication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `confirmed` on the `MedicationLog` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Allergy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChronicCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SymptomAnswer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likelyConditions` to the `SymptomCheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptoms` to the `SymptomCheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SymptomCheck` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TriageLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "FollowUpTiming" AS ENUM ('ASAP', 'WITHIN_24H', 'WITHIN_48H', 'WITHIN_1WEEK', 'MONITOR_ONLY');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER';

-- DropForeignKey
ALTER TABLE "Allergy" DROP CONSTRAINT "Allergy_medicalProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ChronicCondition" DROP CONSTRAINT "ChronicCondition_medicalProfileId_fkey";

-- DropForeignKey
ALTER TABLE "SymptomAnswer" DROP CONSTRAINT "SymptomAnswer_symptomCheckId_fkey";

-- DropIndex
DROP INDEX "User_google_id_key";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "EmergencyContact" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HealthMetric" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "MealItem" ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "MealPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MedicalProfile" DROP COLUMN "birthDate",
DROP COLUMN "gender",
ADD COLUMN     "allergies" JSONB,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "medications" JSONB,
ALTER COLUMN "heightCm" DROP NOT NULL,
ALTER COLUMN "weightKg" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "frequency" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "schedule",
ADD COLUMN     "schedule" JSONB;

-- AlterTable
ALTER TABLE "MedicationLog" DROP COLUMN "confirmed",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'TAKEN';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionTaken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "isActionable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SymptomCheck" ADD COLUMN     "aiModelUsed" TEXT DEFAULT 'gemini-2.5-flash',
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "followUpTiming" "FollowUpTiming" NOT NULL DEFAULT 'MONITOR_ONLY',
ADD COLUMN     "homeCareAdvice" JSONB,
ADD COLUMN     "immediateAction" TEXT,
ADD COLUMN     "likelyConditions" JSONB NOT NULL,
ADD COLUMN     "recommendedSpecialist" JSONB,
ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "severityHint" TEXT,
ADD COLUMN     "shouldSeeDoctor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "symptoms" JSONB NOT NULL,
ADD COLUMN     "triageLevel" "TriageLevel" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "warningSigns" JSONB;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "google_id",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" "Gender";

-- DropTable
DROP TABLE "Allergy";

-- DropTable
DROP TABLE "ChronicCondition";

-- DropTable
DROP TABLE "SymptomAnswer";

-- CreateIndex
CREATE INDEX "Consultation_userId_status_idx" ON "Consultation"("userId", "status");

-- CreateIndex
CREATE INDEX "Consultation_userId_scheduledAt_idx" ON "Consultation"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_isPrimary_idx" ON "EmergencyContact"("userId", "isPrimary");

-- CreateIndex
CREATE INDEX "HealthMetric_userId_createdAt_idx" ON "HealthMetric"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MealPlan_userId_date_idx" ON "MealPlan"("userId", "date");

-- CreateIndex
CREATE INDEX "Medication_userId_isActive_idx" ON "Medication"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Medication_userId_startDate_idx" ON "Medication"("userId", "startDate");

-- CreateIndex
CREATE INDEX "MedicationLog_medicationId_takenAt_idx" ON "MedicationLog"("medicationId", "takenAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_scheduledAt_idx" ON "Notification"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "SymptomCheck_userId_createdAt_idx" ON "SymptomCheck"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SymptomCheck_triageLevel_idx" ON "SymptomCheck"("triageLevel");

-- CreateIndex
CREATE INDEX "SymptomCheck_riskLevel_idx" ON "SymptomCheck"("riskLevel");

-- CreateIndex
CREATE INDEX "SymptomCheck_shouldSeeDoctor_idx" ON "SymptomCheck"("shouldSeeDoctor");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");
