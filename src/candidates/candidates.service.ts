
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { CandidateEmailService } from './candidate-email.service.js';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly candidateEmailService: CandidateEmailService,
  ) {}

  async findAll() {
    return this.prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        qualification: true,
        experienceLevel: true,
        skills: true,
        preferredRole: true,
        hiringMarket: true,
        destinationCountry: true,
        expectedSalary: true,
        noticePeriod: true,
        availability: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async create(dto: CreateCandidateDto) {
    if (dto.consent !== true) {
      throw new BadRequestException(
        'Consent is required to submit the registration.',
      );
    }

    const hiringMarket = dto.hiringMarket;
    const destinationCountry = dto.destinationCountry?.trim();

    if (
      (hiringMarket === 'Overseas' || hiringMarket === 'Both') &&
      !destinationCountry
    ) {
      throw new BadRequestException(
        'Destination country is required for Overseas or Both.',
      );
    }

    // Save the candidate first.
    const candidate = await this.prisma.candidate.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        city: dto.city.trim(),
        country: dto.country?.trim() || 'India',
        qualification: dto.qualification.trim(),
        experienceLevel: dto.experienceLevel.trim(),
        skills: dto.skills?.trim() || null,
        preferredRole: dto.preferredRole.trim(),
        hiringMarket,
        destinationCountry:
          hiringMarket === 'India' ? null : destinationCountry || null,
        expectedSalary: dto.expectedSalary?.trim() || null,
        noticePeriod: dto.noticePeriod?.trim() || null,
        availability: dto.availability?.trim() || null,
        consent: true,
      },
      select: {
        id: true,
        referenceNumber: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        qualification: true,
        experienceLevel: true,
        skills: true,
        preferredRole: true,
        hiringMarket: true,
        destinationCountry: true,
        expectedSalary: true,
        noticePeriod: true,
        availability: true,
        status: true,
        createdAt: true,
      },
    });

    // Send emails without failing the registration if email delivery fails.
    try {
      await this.candidateEmailService.sendRegistrationNotifications(
        candidate,
      );
    } catch (error) {
      this.logger.error(
        'Failed to trigger candidate registration emails.',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      message: 'Candidate registration submitted successfully.',
      candidate: {
        id: candidate.id,
        referenceNumber: candidate.referenceNumber,
        fullName: candidate.fullName,
        status: candidate.status,
        createdAt: candidate.createdAt,
      },
    };
  }
}
