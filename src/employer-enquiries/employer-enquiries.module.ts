
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { EmployerEnquiriesController } from './employer-enquiries.controller.js';
import { EmployerEnquiriesService } from './employer-enquiries.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [EmployerEnquiriesController],
  providers: [EmployerEnquiriesService],
})
export class EmployerEnquiriesModule {}
