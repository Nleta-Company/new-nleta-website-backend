
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EnquiryEmailService } from './enquiry-email.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactEnquiryDto } from './dto/create-contact-enquiry.dto.js';

type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

@Injectable()
export class ContactEnquiriesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly enquiryEmailService: EnquiryEmailService,
    ) { }

    // Save a new enquiry submitted through the public website form

    // Save a new enquiry submitted through the public website form
    async create(dto: CreateContactEnquiryDto) {
        const enquiry = await this.prisma.contactEnquiry.create({
            data: {
                name: dto.name.trim(),
                organization: dto.organization?.trim() || null,
                email: dto.email.trim().toLowerCase(),
                phone: dto.phone?.trim() || null,
                enquiryType: dto.enquiryType.trim(),
                sector: dto.sector?.trim() || null,
                subject: dto.subject?.trim() || null,
                message: dto.message.trim(),
                consent: dto.consent,
            },
        });

        // Send admin notification and visitor confirmation emails.
        // Email failures must not prevent a successful enquiry submission.
        try {
            await this.enquiryEmailService.sendEnquiryNotifications(enquiry);
        } catch (error) {
            // Log the error without exposing internal details to the visitor.
            console.error('Failed to trigger enquiry email notifications:', error);
        }

        return {
            success: true,
            message: 'Your enquiry has been submitted successfully.',
            data: {
                id: enquiry.id,
                createdAt: enquiry.createdAt,
            },
        };
    }


    // List enquiries with optional search and status filters
    async findAll(search?: string, status?: string) {
        const where = {
            status:
                status && ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)
                    ? (status as 'NEW' | 'IN_PROGRESS' | 'RESOLVED')
                    : undefined,
            ...(search?.trim()
                ? {
                    OR: [
                        { name: { contains: search.trim(), mode: 'insensitive' as const } },
                        { email: { contains: search.trim(), mode: 'insensitive' as const } },
                        {
                            organization: {
                                contains: search.trim(),
                                mode: 'insensitive' as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        if (status && ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            where.status = status as EnquiryStatus;
        }

        const term = search?.trim();

        if (term) {
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
                { organization: { contains: term, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.contactEnquiry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 100,
            }),
            this.prisma.contactEnquiry.count({ where }),
        ]);

        return {
            data,
            total,
        };
    }

    // Update the status of an existing enquiry
    async updateStatus(id: string, status: EnquiryStatus) {
        return this.prisma.contactEnquiry.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                status: true,
                updatedAt: true,
            },
        });
    }
}
