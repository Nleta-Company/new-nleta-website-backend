
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ContactEnquiriesModule } from '../contact-enquiries/contact-enquiries.module.js';
import { EvidenceStorageService } from '../common/evidence-storage.service.js';
import { ComplaintsController } from './complaints.controller.js';
import { ComplaintsService } from './complaints.service.js';

@Module({
  imports: [
    PrismaModule,
    ContactEnquiriesModule,
    AdminAuthModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, EvidenceStorageService],
})
export class ComplaintsModule {}
