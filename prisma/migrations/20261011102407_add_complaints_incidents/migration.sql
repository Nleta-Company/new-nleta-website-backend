-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "category" TEXT NOT NULL,
    "relatedReference" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterEmail" TEXT NOT NULL,
    "reporterPhone" TEXT,
    "organization" TEXT,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "injuryDetails" TEXT,
    "immediateAction" TEXT,
    "consent" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complaintId" TEXT,
    "incidentReportId" TEXT,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_referenceNumber_key" ON "Complaint"("referenceNumber");

-- CreateIndex
CREATE INDEX "Complaint_status_createdAt_idx" ON "Complaint"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_email_idx" ON "Complaint"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_referenceNumber_key" ON "IncidentReport"("referenceNumber");

-- CreateIndex
CREATE INDEX "IncidentReport_status_createdAt_idx" ON "IncidentReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "IncidentReport_incidentDate_idx" ON "IncidentReport"("incidentDate");

-- CreateIndex
CREATE INDEX "IncidentReport_reporterEmail_idx" ON "IncidentReport"("reporterEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceFile_storageKey_key" ON "EvidenceFile"("storageKey");

-- CreateIndex
CREATE INDEX "EvidenceFile_complaintId_idx" ON "EvidenceFile"("complaintId");

-- CreateIndex
CREATE INDEX "EvidenceFile_incidentReportId_idx" ON "EvidenceFile"("incidentReportId");

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_incidentReportId_fkey" FOREIGN KEY ("incidentReportId") REFERENCES "IncidentReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
