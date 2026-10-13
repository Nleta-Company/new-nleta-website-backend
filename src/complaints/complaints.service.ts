
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
import { CreateComplaintDto } from './dto/create-complaint.dto.js';

const ALLOWED_CATEGORIES = [
  'Service Quality',
  'Staff Conduct',
  'Testing Process',
  'Communication',
  'Billing',
  'Other',
];

const ALLOWED_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'RESOLVED',
  'CLOSED',
];

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evidenceStorage: EvidenceStorageService,
    private readonly emailService: EnquiryEmailService,
  ) {}

  // Public complaint submission and email notifications.
  async create(dto: CreateComplaintDto, files: EvidenceUpload[] = []) {
    if (dto.consent !== true) {
      throw new BadRequestException(
        'Consent is required to submit a complaint.',
      );
    }

    if (!ALLOWED_CATEGORIES.includes(dto.category)) {
      throw new BadRequestException('Invalid complaint category.');
    }

    const savedFiles = await this.evidenceStorage.saveFiles(files);

    let complaint;

    try {
      complaint = await this.prisma.complaint.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.trim().toLowerCase(),
          phone: dto.phone?.trim() || null,
          organization: dto.organization?.trim() || null,
          category: dto.category,
          relatedReference: dto.relatedReference?.trim() || null,
          subject: dto.subject.trim(),
          description: dto.description.trim(),
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
        'Failed to save complaint and evidence metadata.',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Your complaint could not be saved. Please try again.',
      );
    }

    try {
      await this.emailService.sendComplaintNotifications({
        referenceNumber: complaint.referenceNumber,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        organization: dto.organization?.trim() || null,
        category: dto.category,
        relatedReference: dto.relatedReference?.trim() || null,
        subject: dto.subject.trim(),
        description: dto.description.trim(),
        createdAt: complaint.createdAt,
        evidence: complaint.evidence.map((file) => ({
          originalName: file.originalName,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Complaint ${complaint.referenceNumber} was saved, but notification processing failed.`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return {
      success: true,
      message: 'Your complaint has been submitted successfully.',
      data: complaint,
    };
  }

  // Admin-only evidence retrieval.
  // The evidence must belong to an existing complaint.
  async getEvidence(evidenceId: string) {
    if (!evidenceId?.trim()) {
      throw new BadRequestException('Evidence ID is required.');
    }

    const complaint = await this.prisma.complaint.findFirst({
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

    const evidence = complaint?.evidence[0];

    if (!evidence) {
      throw new NotFoundException('Complaint evidence not found.');
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
      throw new BadRequestException('Invalid complaint status.');
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
              { name: { contains: term, mode: 'insensitive' as const } },
              { email: { contains: term, mode: 'insensitive' as const } },
              { subject: { contains: term, mode: 'insensitive' as const } },
              {
                organization: {
                  contains: term,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          referenceNumber: true,
          name: true,
          email: true,
          phone: true,
          organization: true,
          category: true,
          relatedReference: true,
          subject: true,
          description: true,
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
      this.prisma.complaint.count({ where }),
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
      throw new BadRequestException('Complaint ID is required.');
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
      throw new BadRequestException('Invalid complaint status.');
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

    const existing = await this.prisma.complaint.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Complaint not found.');
    }

    const data = await this.prisma.complaint.update({
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
      message: 'Complaint updated successfully.',
      data,
    };
  }
}
