
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../admin-auth/admin-auth.guard.js';
import { ContactEnquiriesService } from './contact-enquiries.service.js';
import { CreateContactEnquiryDto } from './dto/create-contact-enquiry.dto.js';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto.js';

@Controller('contact-enquiries')
export class ContactEnquiriesController {
  constructor(
    private readonly contactEnquiriesService: ContactEnquiriesService,
  ) {}

  // Public endpoint: website contact form submission
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContactEnquiryDto) {
    return this.contactEnquiriesService.create(dto);
  }

  // Protected endpoint: list enquiries for admins
  @Get()
  @UseGuards(AdminAuthGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return {
      success: true,
      data: await this.contactEnquiriesService.findAll(search, status),
    };
  }

  // Protected endpoint: update enquiry status
  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    try {
      return {
        success: true,
        data: await this.contactEnquiriesService.updateStatus(
          id,
          dto.status,
        ),
      };
    } catch (error) {
      // Prisma P2025 means the requested record was not found.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Enquiry not found');
      }

      throw error;
    }
  }
}
