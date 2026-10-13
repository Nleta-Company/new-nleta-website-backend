
import { IsIn, IsString } from 'class-validator';

export class UpdateEnquiryStatusDto {
  @IsString()
  @IsIn(['NEW', 'IN_PROGRESS', 'RESOLVED'])
  status!: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
}
