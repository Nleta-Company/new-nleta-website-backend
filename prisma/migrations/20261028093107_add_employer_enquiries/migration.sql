-- CreateEnum
CREATE TYPE "EmployerEnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "EmployerEnquiry" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "employerType" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "agencyLicence" TEXT,
    "contactName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "recruitmentModel" TEXT NOT NULL,
    "sponsorship" TEXT,
    "accommodation" TEXT NOT NULL,
    "transport" TEXT,
    "workingHours" TEXT NOT NULL,
    "weeklyOff" TEXT,
    "additionalConditions" TEXT,
    "declaration" BOOLEAN NOT NULL DEFAULT false,
    "status" "EmployerEnquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerHiringRequirement" (
    "id" TEXT NOT NULL,
    "hiringMarket" TEXT NOT NULL,
    "destinationCountry" TEXT,
    "industry" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "qualification" TEXT,
    "experience" TEXT,
    "salary" TEXT NOT NULL,
    "jobLocation" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "contractDuration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employerEnquiryId" TEXT NOT NULL,

    CONSTRAINT "EmployerHiringRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployerEnquiry_referenceNumber_key" ON "EmployerEnquiry"("referenceNumber");

-- CreateIndex
CREATE INDEX "EmployerEnquiry_email_idx" ON "EmployerEnquiry"("email");

-- CreateIndex
CREATE INDEX "EmployerEnquiry_status_createdAt_idx" ON "EmployerEnquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmployerEnquiry_companyName_idx" ON "EmployerEnquiry"("companyName");

-- CreateIndex
CREATE INDEX "EmployerHiringRequirement_employerEnquiryId_idx" ON "EmployerHiringRequirement"("employerEnquiryId");

-- CreateIndex
CREATE INDEX "EmployerHiringRequirement_jobRole_idx" ON "EmployerHiringRequirement"("jobRole");

-- AddForeignKey
ALTER TABLE "EmployerHiringRequirement" ADD CONSTRAINT "EmployerHiringRequirement_employerEnquiryId_fkey" FOREIGN KEY ("employerEnquiryId") REFERENCES "EmployerEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
