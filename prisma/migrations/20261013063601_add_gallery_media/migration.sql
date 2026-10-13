-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "GalleryMedia" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "GalleryMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryMedia_storageKey_key" ON "GalleryMedia"("storageKey");

-- CreateIndex
CREATE INDEX "GalleryMedia_isPublished_createdAt_idx" ON "GalleryMedia"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "GalleryMedia_type_isPublished_idx" ON "GalleryMedia"("type", "isPublished");
