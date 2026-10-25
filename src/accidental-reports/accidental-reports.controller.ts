import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AccidentalReportsService } from './accidental-reports.service.js';
import { CreateAccidentalReportDto } from './dto/create-accidental-report.dto.js';
import { UpdateAccidentalReportDto } from './dto/update-accidental-report.dto.js';
import { QueryAccidentalReportDto } from './dto/query-accidental-report.dto.js';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard.js';

@Controller('accidental-reports')
export class AccidentalReportsController {
  constructor(
    private readonly accidentalReportsService: AccidentalReportsService,
  ) {}

  // Public: website can read reports
  @Get()
  findAll(@Query() query: QueryAccidentalReportDto) {
    return this.accidentalReportsService.findAll(query);
  }

  // Public: website can open a single report
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accidentalReportsService.findOne(id);
  }

  // Admin only
  @Post()
  @UseGuards(AdminAuthGuard)
  create(@Body() dto: CreateAccidentalReportDto) {
    return this.accidentalReportsService.create(dto);
  }

  // Admin only
  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccidentalReportDto,
  ) {
    return this.accidentalReportsService.update(id, dto);
  }

  // Admin only
  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string) {
    return this.accidentalReportsService.remove(id);
  }
}