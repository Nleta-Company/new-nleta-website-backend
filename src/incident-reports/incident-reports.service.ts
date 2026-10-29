

import {

  BadRequestException,

  Injectable,

  InternalServerErrorException,

  Logger,

  NotFoundException,

} from '@nestjs/common';



import { PrismaService } from '../prisma/prisma.service.js';

import {

  EvidenceStorageService,

  type EvidenceUpload,

} from '../common/evidence-storage.service.js';

import { EnquiryEmailService } from '../contact-enquiries/enquiry-email.service.js';

import { CreateIncidentReportDto } from './dto/create-incident-report.dto.js';



const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];



const ALLOWED_INCIDENT_TYPES = [

  'Accident',

  'Equipment Failure',

  'Person Trapped',

  'Injury',

  'Fire',

  'Electrical Issue',

  'Safety Hazard',

  'Other',

];



const ALLOWED_STATUSES = [

  'NEW',

  'UNDER_REVIEW',

  'RESOLVED',

  'CLOSED',

];



@Injectable()

export class IncidentReportsService {

  private readonly logger = new Logger(IncidentReportsService.name);



  constructor(

    private readonly prisma: PrismaService,

    private readonly evidenceStorage: EvidenceStorageService,

    private readonly emailService: EnquiryEmailService,

  ) {}



  // Public incident submission and email notifications.

  async create(dto: CreateIncidentReportDto, files: EvidenceUpload[] = []) {

    if (dto.consent !== true) {

      throw new BadRequestException(

        'Consent is required to submit an incident report.',

      );

    }



    if (!ALLOWED_SEVERITIES.includes(dto.severity)) {

      throw new BadRequestException('Invalid incident severity.');

    }



    if (!ALLOWED_INCIDENT_TYPES.includes(dto.incidentType)) {

      throw new BadRequestException('Invalid incident type.');

    }



    const incidentDate = new Date(dto.incidentDate);



    if (Number.isNaN(incidentDate.getTime())) {

      throw new BadRequestException('Invalid incident date.');

    }



    const savedFiles = await this.evidenceStorage.saveFiles(files);



    let report;



    try {

      report = await this.prisma.incidentReport.create({

        data: {

          reporterName: dto.reporterName.trim(),

          reporterEmail: dto.reporterEmail.trim().toLowerCase(),

          reporterPhone: dto.reporterPhone?.trim() || null,

          organization: dto.organization?.trim() || null,

          incidentType: dto.incidentType,

          severity: dto.severity,

          incidentDate,

          location: dto.location.trim(),


          description: dto.description.trim(),

          injuryDetails: dto.injuryDetails?.trim() || null,

          immediateAction: dto.immediateAction?.trim() || null,

          consent: dto.consent,

          evidence: {

            create: savedFiles.map((file) => ({

              originalName: file.originalName,

              storageKey: file.storageKey,

              mimeType: file.mimeType,

              sizeBytes: file.sizeBytes,

            })),

          },

        },

        select: {

          id: true,

          referenceNumber: true,

          createdAt: true,

          evidence: {

            select: {

              id: true,

              originalName: true,

              mimeType: true,

              sizeBytes: true,

            },

          },

        },

      });

    } catch (error) {

      this.logger.error(

        'Failed to save incident report and evidence metadata.',

        error instanceof Error ? error.stack : undefined,

      );



      throw new InternalServerErrorException(

        'Your incident report could not be saved. Please try again.',

      );

    }



    try {

      await this.emailService.sendIncidentNotifications({

        referenceNumber: report.referenceNumber,

        reporterName: dto.reporterName.trim(),

        reporterEmail: dto.reporterEmail.trim().toLowerCase(),

        reporterPhone: dto.reporterPhone?.trim() || null,

        organization: dto.organization?.trim() || null,

        incidentType: dto.incidentType,

        severity: dto.severity,

        incidentDate,

        location: dto.location.trim(),

        description: dto.description.trim(),

        injuryDetails: dto.injuryDetails?.trim() || null,

        immediateAction: dto.immediateAction?.trim() || null,

        createdAt: report.createdAt,

        evidence: report.evidence.map((file) => ({

          originalName: file.originalName,

        })),

      });

    } catch (error) {

      this.logger.error(

        `Incident ${report.referenceNumber} was saved, but notification processing failed.`,

        error instanceof Error ? error.stack : undefined,

      );

    }



    return {

      success: true,

      message: 'Your incident report has been submitted successfully.',

      data: report,

    };

  }



  // Admin-only evidence retrieval.

  // The evidence must belong to an existing incident report.

  async getEvidence(evidenceId: string) {

    if (!evidenceId?.trim()) {

      throw new BadRequestException('Evidence ID is required.');

    }



    const report = await this.prisma.incidentReport.findFirst({

      where: {

        evidence: {

          some: { id: evidenceId },

        },

      },

      select: {

        evidence: {

          where: { id: evidenceId },

          select: {

            id: true,

            originalName: true,

            storageKey: true,

            mimeType: true,

          },

        },

      },

    });



    const evidence = report?.evidence[0];



    if (!evidence) {

      throw new NotFoundException('Incident evidence not found.');

    }



    const buffer = await this.evidenceStorage.readFile(

      evidence.storageKey,

    );



    return {

      buffer,

      originalName: evidence.originalName,

      mimeType: evidence.mimeType,

    };

  }



  // Admin-only list, search and status filtering.

  async adminList(search?: string, status?: string) {

    if (status && !ALLOWED_STATUSES.includes(status)) {

      throw new BadRequestException('Invalid incident status.');

    }



    const term = search?.trim();



    const where = {

      ...(status ? { status } : {}),

      ...(term

        ? {

            OR: [

              {

                referenceNumber: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

              {

                reporterName: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

              {

                reporterEmail: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

              {

                location: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

              {

                incidentType: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

              {

                description: {

                  contains: term,

                  mode: 'insensitive' as const,

                },

              },

            ],

          }

        : {}),

    };



    const [data, total] = await Promise.all([

      this.prisma.incidentReport.findMany({

        where,

        orderBy: { createdAt: 'desc' },

        take: 100,

        select: {

          id: true,

          referenceNumber: true,

          reporterName: true,

          reporterEmail: true,

          reporterPhone: true,

          organization: true,

          incidentType: true,

          severity: true,

          incidentDate: true,

          location: true,


          description: true,

          injuryDetails: true,

          immediateAction: true,

          status: true,

          adminNotes: true,

          createdAt: true,

          updatedAt: true,

          evidence: {

            select: {

              id: true,

              originalName: true,

              mimeType: true,

              sizeBytes: true,

            },

          },

        },

      }),

      this.prisma.incidentReport.count({ where }),

    ]);



    return {

      success: true,

      data,

      total,

      limit: 100,

    };

  }



  // Admin-only status and notes update.

  async adminUpdate(

    id: string,

    body: { status?: string; adminNotes?: string },

  ) {

    if (!id?.trim()) {

      throw new BadRequestException('Incident report ID is required.');

    }



    if (body.status === undefined && body.adminNotes === undefined) {

      throw new BadRequestException(

        'Provide a status or adminNotes to update.',

      );

    }



    if (

      body.status !== undefined &&

      !ALLOWED_STATUSES.includes(body.status)

    ) {

      throw new BadRequestException('Invalid incident status.');

    }



    if (

      body.adminNotes !== undefined &&

      (typeof body.adminNotes !== 'string' ||

        body.adminNotes.length > 5000)

    ) {

      throw new BadRequestException(

        'Admin notes must be a string of at most 5000 characters.',

      );

    }



    const existing = await this.prisma.incidentReport.findUnique({

      where: { id },

      select: { id: true },

    });



    if (!existing) {

      throw new NotFoundException('Incident report not found.');

    }



    const data = await this.prisma.incidentReport.update({

      where: { id },

      data: {

        ...(body.status !== undefined ? { status: body.status } : {}),

        ...(body.adminNotes !== undefined

          ? { adminNotes: body.adminNotes.trim() || null }

          : {}),

      },

      select: {

        id: true,

        referenceNumber: true,

        status: true,

        adminNotes: true,

        updatedAt: true,

      },

    });
    return {

      success: true,

      message: 'Incident report updated successfully.',

      data,

    };

  }

  
  // Admin-only deletion of the selected incident report.
  async adminDelete(id: string) {
    if (!id?.trim()) {
      throw new BadRequestException('Incident report ID is required.');
    }

    const existing = await this.prisma.incidentReport.findUnique({
      where: { id },
      select: {
        id: true,
        referenceNumber: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Incident report not found.');
    }

    // Remove linked evidence metadata and the report in one transaction.
    await this.prisma.$transaction(async (tx) => {
      await tx.incidentReport.update({
        where: { id },
        data: {
          evidence: {
            deleteMany: {},
          },
        },
      });

      await tx.incidentReport.delete({
        where: { id },
      });
    });

    return {
      success: true,
      message: 'Incident report deleted successfully.',
      data: {
        id: existing.id,
        referenceNumber: existing.referenceNumber,
      },
    };
  }


}
