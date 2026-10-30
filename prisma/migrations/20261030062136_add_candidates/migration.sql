-- CreateEnum
CREATE TYPE "CandidateRegistrationStatus" AS ENUM ('NEW', 'REVIEWING', 'SHORTLISTED', 'CONTACTED', 'HIRED', 'REJECTED');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "qualification" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "skills" TEXT,
    "preferredRole" TEXT NOT NULL,
    "hiringMarket" TEXT NOT NULL,
    "destinationCountry" TEXT,
    "expectedSalary" TEXT,
    "noticePeriod" TEXT,
    "availability" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" "CandidateRegistrationStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_referenceNumber_key" ON "Candidate"("referenceNumber");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_status_createdAt_idx" ON "Candidate"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Candidate_preferredRole_idx" ON "Candidate"("preferredRole");

-- CreateIndex
CREATE INDEX "Candidate_hiringMarket_idx" ON "Candidate"("hiringMarket");
