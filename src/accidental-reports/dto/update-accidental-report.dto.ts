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

export class UpdateAccidentalReportDto {
    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    state?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    location?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    equipment?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    details?: string;

    @IsOptional()
    @IsEnum(AccidentalReportType)
    type?: AccidentalReportType;

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