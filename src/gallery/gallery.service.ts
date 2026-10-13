
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GalleryMediaType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { GalleryStorageService } from "./gallery-storage.service.js";

const MAX_PHOTO_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: GalleryStorageService,
  ) {}

  private validateFile(
    file: Express.Multer.File,
    type: GalleryMediaType,
  ) {
    if (!file) {
      throw new BadRequestException("Please select a file.");
    }

    const allowed =
      type === GalleryMediaType.PHOTO
        ? ["image/jpeg", "image/png", "image/webp"]
        : ["video/mp4", "video/webm", "video/quicktime"];

    const maxSize =
      type === GalleryMediaType.PHOTO
        ? MAX_PHOTO_SIZE
        : MAX_VIDEO_SIZE;

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported ${type.toLowerCase()} file format.`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File exceeds the ${type === GalleryMediaType.PHOTO ? "15 MB" : "250 MB"} limit.`,
      );
    }

    if (!file.size) {
      throw new BadRequestException("The uploaded file is empty.");
    }
  }

  async listPublic() {
    return this.prisma.galleryMedia.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        type: true,
        url: true,
        thumbnailUrl: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAdmin() {
    return this.prisma.galleryMedia.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async upload(
    file: Express.Multer.File,
    title: string,
    type: GalleryMediaType,
    isPublished: boolean,
    adminId?: string,
  ) {
    if (!title?.trim()) {
      throw new BadRequestException("A media title is required.");
    }

    this.validateFile(file, type);

    const uploaded = await this.storage.upload(file, type);

    try {
      return await this.prisma.galleryMedia.create({
        data: {
          title: title.trim(),
          type,
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          storageKey: uploaded.storageKey,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
          isPublished,
          uploadedById: adminId,
        },
      });
    } catch {
      // Avoid leaving an orphaned storage object if the database write fails.
      await this.storage.delete(uploaded.storageKey, type).catch(() => undefined);
      throw new BadRequestException("Could not save gallery metadata.");
    }
  }

  async setPublished(id: string, isPublished: boolean) {
    const existing = await this.prisma.galleryMedia.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Gallery media not found.");
    }

    return this.prisma.galleryMedia.update({
      where: { id },
      data: { isPublished },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.galleryMedia.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Gallery media not found.");
    }

    // Delete from storage first. Keep the database record if storage deletion fails.
    await this.storage.delete(existing.storageKey, existing.type);

    await this.prisma.galleryMedia.delete({
      where: { id },
    });

    return { success: true, id };
  }
}
