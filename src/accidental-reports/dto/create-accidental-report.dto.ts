import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';
import {
    AccidentalReportStatus,
    AccidentalReportType,
} from '@prisma/client';

export class CreateAccidentalReportDto {
    @IsDateString()
    date!: string;

    @IsString()
    @IsNotEmpty()
    state!: string;

    @IsString()
    @IsNotEmpty()
    location!: string;

    @IsString()
    @IsNotEmpty()
    equipment!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    details!: string;

    @IsEnum(AccidentalReportType)
    type!: AccidentalReportType;

    @IsOptional()
    @IsInt()
    @Min(0)
    fatalities?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    injuries?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    trapped?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    other?: number;

 

    @IsOptional()
    @IsUrl()
    sourceLink?: string;

    @IsOptional()
    @IsEnum(AccidentalReportStatus)
    status?: AccidentalReportStatus;
}