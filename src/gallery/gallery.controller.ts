
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { GalleryMediaType } from "@prisma/client";
import type { Request } from "express";
import { GalleryService } from "./gallery.service.js";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard.js";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    sub?: string;
  };
};

@Controller("gallery/media")
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Public website: only published media is returned.
  @Get()
  listPublic(@Query("scope") scope?: string) {
    if (scope === "admin") {
      throw new BadRequestException(
        "Use the authenticated admin gallery endpoint.",
      );
    }

    return this.galleryService.listPublic();
  }

  // Admin website: all media, including unpublished drafts.
  @Get("admin")
  @UseGuards(AdminAuthGuard)
  listAdmin() {
    return this.galleryService.listAdmin();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 250 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, file, callback) => {
        const allowed =
          file.mimetype.startsWith("image/") ||
          file.mimetype.startsWith("video/");

        if (!allowed) {
          return callback(
            new BadRequestException("Only image and video files are allowed."),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("title") title: string,
    @Body("type", new ParseEnumPipe(GalleryMediaType))
    type: GalleryMediaType,
    @Body("isPublished") isPublished: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const adminId = request.user?.id ?? request.user?.sub;

    return this.galleryService.upload(
      file,
      title,
      type,
      isPublished === "true",
      adminId,
    );
  }

  @Patch(":id/publish")
  @UseGuards(AdminAuthGuard)
  publish(
    @Param("id") id: string,
    @Body("isPublished") isPublished: boolean,
  ) {
    if (typeof isPublished !== "boolean") {
      throw new BadRequestException(
        "isPublished must be a boolean.",
      );
    }

    return this.galleryService.setPublished(id, isPublished);
  }

  @Delete(":id")
  @UseGuards(AdminAuthGuard)
  delete(@Param("id") id: string) {
    return this.galleryService.delete(id);
  }
}
