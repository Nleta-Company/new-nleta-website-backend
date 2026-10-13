
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateIncidentReportDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  reporterName!: string;

  @IsEmail()
  @MaxLength(254)
  reporterEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  reporterPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organization?: string;

  @IsString()
  @MaxLength(100)
  incidentType!: string;

  @IsString()
  @MaxLength(30)
  severity!: string;

  @IsDateString()
  incidentDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  relatedReference?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  injuryDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  immediateAction?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  consent!: boolean;
}
