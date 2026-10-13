
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminAuthModule } from "../admin-auth/admin-auth.module.js";
import { GalleryController } from "./gallery.controller.js";
import { GalleryService } from "./gallery.service.js";
import { GalleryStorageService } from "./gallery-storage.service.js";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AdminAuthModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService, GalleryStorageService],
})
export class GalleryModule {}
