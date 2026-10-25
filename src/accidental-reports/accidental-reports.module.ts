import { Module } from '@nestjs/common';
import { AccidentalReportsController } from './accidental-reports.controller.js';
import { AccidentalReportsService } from './accidental-reports.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AccidentalReportsController],
  providers: [AccidentalReportsService],
})
export class AccidentalReportsModule {}