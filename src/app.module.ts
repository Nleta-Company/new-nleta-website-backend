import { GalleryModule } from "./gallery/gallery.module.js";
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ContactEnquiriesModule } from './contact-enquiries/contact-enquiries.module.js';
import { AdminAuthModule } from './admin-auth/admin-auth.module.js';
import { ComplaintsModule } from './complaints/complaints.module.js';
import { IncidentReportsModule } from './incident-reports/incident-reports.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ContactEnquiriesModule,
    AdminAuthModule,
    ComplaintsModule,
    IncidentReportsModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
