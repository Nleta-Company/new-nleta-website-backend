-- AlterTable
ALTER TABLE "ContactEnquiry" ADD COLUMN     "consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enquiryType" TEXT NOT NULL DEFAULT 'General Enquiry',
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "sector" TEXT;
