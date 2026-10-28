
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard.js';
import type { CreateEmployerEnquiryInput } from './employer-enquiries.service.js';
import { EmployerEnquiriesService } from './employer-enquiries.service.js';

@Controller('employer-enquiries')
export class EmployerEnquiriesController {
  constructor(
    private readonly employerEnquiriesService: EmployerEnquiriesService,
  ) {}

  // Public endpoint: client submits the Employer Connect form.
  @Post()
  create(@Body() body: CreateEmployerEnquiryInput) {
    return this.employerEnquiriesService.create(body);
  }

  // The following endpoints require an authenticated admin.
  @Get()
  @UseGuards(AdminAuthGuard)
  findAll(@Query('status') status?: string) {
    return this.employerEnquiriesService.findAll(status);
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  findOne(@Param('id') id: string) {
    return this.employerEnquiriesService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      adminNotes?: string;
    },
  ) {
    return this.employerEnquiriesService.updateStatus(
      id,
      body.status,
      body.adminNotes,
    );
  }
}
