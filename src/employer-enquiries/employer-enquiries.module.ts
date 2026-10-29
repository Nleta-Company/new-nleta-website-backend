
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { EmployerEnquiriesController } from './employer-enquiries.controller.js';
import { EmployerEnquiriesService } from './employer-enquiries.service.js';
import { EmployerEnquiryEmailService } from './employer-enquiry-email.service.js';
@Module({
  imports: [ConfigModule, PrismaModule, AdminAuthModule],
  controllers: [EmployerEnquiriesController],
  providers: [
    EmployerEnquiriesService,
    EmployerEnquiryEmailService,
  ],
})
export class EmployerEnquiriesModule { }
