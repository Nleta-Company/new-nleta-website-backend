
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  qualification: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  experienceLevel: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  skills?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  preferredRole: string;

  @IsIn(['India', 'Overseas', 'Both'])
  hiringMarket: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  expectedSalary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  noticePeriod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  availability?: string;

  @IsBoolean()
  consent: boolean;
}
