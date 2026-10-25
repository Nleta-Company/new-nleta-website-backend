-- CreateEnum
CREATE TYPE "AccidentalReportType" AS ENUM ('TRAPPED', 'FATAL', 'INJURED', 'OTHER');

-- CreateEnum
CREATE TYPE "AccidentalReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AccidentalReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "type" "AccidentalReportType" NOT NULL,
    "fatalities" INTEGER NOT NULL DEFAULT 0,
    "injuries" INTEGER NOT NULL DEFAULT 0,
    "trapped" INTEGER NOT NULL DEFAULT 0,
    "sourceLink" TEXT,
    "status" "AccidentalReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccidentalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccidentalReport_date_idx" ON "AccidentalReport"("date");

-- CreateIndex
CREATE INDEX "AccidentalReport_state_date_idx" ON "AccidentalReport"("state", "date");

-- CreateIndex
CREATE INDEX "AccidentalReport_type_date_idx" ON "AccidentalReport"("type", "date");

-- CreateIndex
CREATE INDEX "AccidentalReport_status_date_idx" ON "AccidentalReport"("status", "date");
