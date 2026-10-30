
import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CandidatesService } from './candidates.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
  ) {}

  // Fetch candidates for the admin dashboard
  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  // Register a new candidate
  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }
}
