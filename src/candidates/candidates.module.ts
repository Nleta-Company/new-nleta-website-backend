
import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller.js';
import { CandidatesService } from './candidates.service.js';
import { CandidateEmailService } from './candidate-email.service.js';

@Module({
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidateEmailService],
})
export class CandidatesModule {}

