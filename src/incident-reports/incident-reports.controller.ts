
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AdminAuthGuard } from '../admin-auth/admin-auth.guard.js';
import type { EvidenceUpload } from '../common/evidence-storage.service.js';
import { IncidentReportsService } from './incident-reports.service.js';
import { CreateIncidentReportDto } from './dto/create-incident-report.dto.js';

const ALLOWED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

@Controller('incident-reports')
export class IncidentReportsController {
  constructor(
    private readonly incidentReportsService: IncidentReportsService,
  ) {}

  // Public incident report submission.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('evidence', 5, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
      },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_EVIDENCE_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPEG, PNG, WebP and PDF files are allowed.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateIncidentReportDto,
    @UploadedFiles() files: EvidenceUpload[],
  ) {
    return this.incidentReportsService.create(dto, files ?? []);
  }

  // Admin-only incident list.
  @Get()
  @UseGuards(AdminAuthGuard)
  list(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.incidentReportsService.adminList(search, status);
  }

  // Admin-only evidence viewing.
  @Get('evidence/:evidenceId')
  @UseGuards(AdminAuthGuard)
  async viewEvidence(
    @Param('evidenceId') evidenceId: string,
    @Res() response: Response,
  ) {
    const file =
      await this.incidentReportsService.getEvidence(evidenceId);

    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, no-store');

    response.send(file.buffer);
  }

  // Admin-only status and notes update.
  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; adminNotes?: string },
  ) {
    return this.incidentReportsService.adminUpdate(id, body);
  }

  // Admin-only deletion of the selected incident report.
  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  deleteReport(@Param('id') id: string) {
    return this.incidentReportsService.adminDelete(id);
  }
}
