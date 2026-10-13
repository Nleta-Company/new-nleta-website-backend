
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ContactEnquiriesModule } from '../contact-enquiries/contact-enquiries.module.js';
import { EvidenceStorageService } from '../common/evidence-storage.service.js';
import { IncidentReportsController } from './incident-reports.controller.js';
import { IncidentReportsService } from './incident-reports.service.js';

@Module({
  imports: [
    PrismaModule,
    ContactEnquiriesModule,
    AdminAuthModule,
  ],
  controllers: [IncidentReportsController],
  providers: [IncidentReportsService, EvidenceStorageService],
})
export class IncidentReportsModule {}
