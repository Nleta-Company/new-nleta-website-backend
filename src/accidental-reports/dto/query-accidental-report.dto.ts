import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  AccidentalReportStatus,
  AccidentalReportType,
} from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryAccidentalReportDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(AccidentalReportType)
  type?: AccidentalReportType;

  @IsOptional()
  @IsEnum(AccidentalReportStatus)
  status?: AccidentalReportStatus;
}