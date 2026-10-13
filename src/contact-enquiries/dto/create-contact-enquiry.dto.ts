
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactEnquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  organization?: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @IsString()
  @MaxLength(100)
  enquiryType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  message!: string;

  @IsBoolean()
  consent!: boolean;
}
