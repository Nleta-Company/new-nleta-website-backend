
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ContactEnquiriesController } from './contact-enquiries.controller.js';
import { ContactEnquiriesService } from './contact-enquiries.service.js';
import { EnquiryEmailService } from './enquiry-email.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [ContactEnquiriesController],
  providers: [ContactEnquiriesService, EnquiryEmailService],
  exports: [EnquiryEmailService],
})
export class ContactEnquiriesModule {}
