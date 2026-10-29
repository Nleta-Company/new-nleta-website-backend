
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployerEnquiryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface HiringRequirementInput {
  hiringMarket: string;
  destinationCountry?: string | null;
  industry: string;
  jobRole: string;
  vacancies: number | string;
  qualification?: string | null;
  experience?: string | null;
  salary: string;
  jobLocation: string;
  employmentType: string;
  contractDuration?: string | null;
}

export interface CreateEmployerEnquiryInput {
  companyName: string;
  employerType: string;
  country: string;
  state?: string | null;
  city: string;
  address?: string | null;
  website?: string | null;
  gstRegistrationNumber?: string | null;
  agencyLicence?: string | null;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  recruitmentModel: string;
  sponsorship?: string | null;
  accommodation: string;
  transport?: string | null;
  workingHours: string;
  weeklyOff?: string | null;
  additionalConditions?: string | null;
  declaration: boolean;
  requirements: HiringRequirementInput[];
}

@Injectable()
export class EmployerEnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  private requiredString(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${field} is required`);
    }

    return value.trim();
  }

  private optionalString(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    return value.trim();
  }

  async create(input: CreateEmployerEnquiryInput) {
    if (input.declaration !== true) {
      throw new BadRequestException(
        'Please accept the declaration before submitting.',
      );
    }

    if (
      !Array.isArray(input.requirements) ||
      input.requirements.length === 0
    ) {
      throw new BadRequestException(
        'Please add at least one hiring requirement.',
      );
    }

    const requirements = input.requirements.map((item, index) => {
      const hiringMarket = this.requiredString(
        item.hiringMarket,
        `Requirement ${index + 1}: hiring market`,
      );

      const vacancies = Number(item.vacancies);

      if (!Number.isInteger(vacancies) || vacancies < 1) {
        throw new BadRequestException(
          `Requirement ${index + 1}: vacancies must be a positive integer.`,
        );
      }

      const employmentType = this.requiredString(
        item.employmentType,
        `Requirement ${index + 1}: employment type`,
      );

      const destinationCountry = this.optionalString(
        item.destinationCountry,
      );

      const contractDuration = this.optionalString(
        item.contractDuration,
      );

      if (
        hiringMarket === 'International' &&
        !destinationCountry
      ) {
        throw new BadRequestException(
          `Requirement ${index + 1}: destination country is required.`,
        );
      }

      if (
        employmentType === 'Contract' &&
        !contractDuration
      ) {
        throw new BadRequestException(
          `Requirement ${index + 1}: contract duration is required.`,
        );
      }

      return {
        hiringMarket,
        destinationCountry,
        industry: this.requiredString(
          item.industry,
          `Requirement ${index + 1}: industry`,
        ),
        jobRole: this.requiredString(
          item.jobRole,
          `Requirement ${index + 1}: job role`,
        ),
        vacancies,
        qualification: this.optionalString(item.qualification),
        experience: this.optionalString(item.experience),
        salary: this.requiredString(
          item.salary,
          `Requirement ${index + 1}: salary`,
        ),
        jobLocation: this.requiredString(
          item.jobLocation,
          `Requirement ${index + 1}: job location`,
        ),
        employmentType,
        contractDuration,
      };
    });

    const hasInternationalRequirement = requirements.some(
      (item) => item.hiringMarket === 'International',
    );

    const sponsorship = this.optionalString(input.sponsorship);

    if (hasInternationalRequirement && !sponsorship) {
      throw new BadRequestException(
        'Work-permit sponsorship details are required for international hiring.',
      );
    }

    const email = this.requiredString(input.email, 'Email').toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException(
        'Please provide a valid email address.',
      );
    }

    return this.prisma.employerEnquiry.create({
      data: {
        companyName: this.requiredString(
          input.companyName,
          'Company name',
        ),
        employerType: this.requiredString(
          input.employerType,
          'Employer type',
        ),
        country: this.requiredString(input.country, 'Country'),
        state: this.optionalString(input.state),
        city: this.requiredString(input.city, 'City'),
        address: this.optionalString(input.address),
        website: this.optionalString(input.website),

        // GST No. / Registration No.
        gstRegistrationNumber: this.optionalString(
          input.gstRegistrationNumber,
        ),

        agencyLicence: this.optionalString(input.agencyLicence),
        contactName: this.requiredString(
          input.contactName,
          'Contact person',
        ),
        designation: this.requiredString(
          input.designation,
          'Designation',
        ),
        email,
        phone: this.requiredString(input.phone, 'Contact number'),
        recruitmentModel: this.requiredString(
          input.recruitmentModel,
          'Recruitment model',
        ),
        sponsorship,
        accommodation: this.requiredString(
          input.accommodation,
          'Accommodation',
        ),
        transport: this.optionalString(input.transport),
        workingHours: this.requiredString(
          input.workingHours,
          'Working hours',
        ),
        weeklyOff: this.optionalString(input.weeklyOff),
        additionalConditions: this.optionalString(
          input.additionalConditions,
        ),
        declaration: true,
        requirements: {
          create: requirements,
        },
      },
      include: {
        requirements: true,
      },
    });
  }

  async findAll(status?: string) {
    let filterStatus: EmployerEnquiryStatus | undefined;

    if (status) {
      if (
        !Object.values(EmployerEnquiryStatus).includes(
          status as EmployerEnquiryStatus,
        )
      ) {
        throw new BadRequestException('Invalid enquiry status.');
      }

      filterStatus = status as EmployerEnquiryStatus;
    }

    return this.prisma.employerEnquiry.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      include: { requirements: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.employerEnquiry.findUnique({
      where: { id },
      include: { requirements: true },
    });

    if (!enquiry) {
      throw new NotFoundException('Employer enquiry not found.');
    }

    return enquiry;
  }

  async updateStatus(
    id: string,
    status: string,
    adminNotes?: string,
  ) {
    if (
      !Object.values(EmployerEnquiryStatus).includes(
        status as EmployerEnquiryStatus,
      )
    ) {
      throw new BadRequestException('Invalid enquiry status.');
    }

    await this.findOne(id);

    return this.prisma.employerEnquiry.update({
      where: { id },
      data: {
        status: status as EmployerEnquiryStatus,
        ...(adminNotes !== undefined
          ? { adminNotes: this.optionalString(adminNotes) }
          : {}),
      },
      include: { requirements: true },
    });
  }
}
