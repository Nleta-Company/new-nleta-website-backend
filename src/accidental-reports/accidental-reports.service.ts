import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
    Prisma,
} from '@prisma/client';
import { CreateAccidentalReportDto } from './dto/create-accidental-report.dto.js';
import { UpdateAccidentalReportDto } from './dto/update-accidental-report.dto.js';
import { QueryAccidentalReportDto } from './dto/query-accidental-report.dto.js';

@Injectable()
export class AccidentalReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateAccidentalReportDto) {
        return this.prisma.accidentalReport.create({
            data: {
                date: new Date(dto.date),
                state: dto.state,
                location: dto.location,
                equipment: dto.equipment,
                title: dto.title,
                details: dto.details,
                type: dto.type,
                fatalities: dto.fatalities ?? 0,
                injuries: dto.injuries ?? 0,
                trapped: dto.trapped ?? 0,
                other: dto.other ?? 0,
                sourceLink: dto.sourceLink,
                status: dto.status,
            },
        });
    }

    async findAll(query: QueryAccidentalReportDto) {
        const where: Prisma.AccidentalReportWhereInput = {};

        if (query.state && query.state !== 'All States') {
            where.state = query.state;
        }

        if (query.type) {
            where.type = query.type;
        }

        if (query.status) {
            where.status = query.status;
        }

        if (query.year) {
            where.date = {
                gte: new Date(`${query.year}-01-01T00:00:00.000Z`),
                lt: new Date(`${query.year + 1}-01-01T00:00:00.000Z`),
            };
        } else if (query.dateFrom || query.dateTo) {
            const dateFilter: Prisma.DateTimeFilter = {};

            if (query.dateFrom) {
                dateFilter.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
            }

            if (query.dateTo) {
                const endDate = new Date(`${query.dateTo}T00:00:00.000Z`);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                dateFilter.lt = endDate;
            }

            where.date = dateFilter;
        }

        return this.prisma.accidentalReport.findMany({
            where,
            orderBy: {
                date: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const report = await this.prisma.accidentalReport.findUnique({
            where: { id },
        });

        if (!report) {
            throw new NotFoundException(
                `Accidental report with ID ${id} not found`,
            );
        }

        return report;
    }

    async update(
        id: string,
        dto: UpdateAccidentalReportDto,
    ) {
        await this.findOne(id);

        return this.prisma.accidentalReport.update({
            where: { id },
            data: {
                ...(dto.date !== undefined && {
                    date: new Date(dto.date),
                }),
                ...(dto.state !== undefined && {
                    state: dto.state,
                }),
                ...(dto.location !== undefined && {
                    location: dto.location,
                }),
                ...(dto.equipment !== undefined && {
                    equipment: dto.equipment,
                }),
                ...(dto.title !== undefined && {
                    title: dto.title,
                }),
                ...(dto.details !== undefined && {
                    details: dto.details,
                }),
                ...(dto.type !== undefined && {
                    type: dto.type,
                }),
                ...(dto.fatalities !== undefined && {
                    fatalities: dto.fatalities,
                }),
                ...(dto.injuries !== undefined && {
                    injuries: dto.injuries,
                }),
                ...(dto.trapped !== undefined && {
                    trapped: dto.trapped,
                }),
                ...(dto.other !== undefined && {
                    other: dto.other,
                }),
                ...(dto.sourceLink !== undefined && {
                    sourceLink: dto.sourceLink,
                }),
                ...(dto.status !== undefined && {
                    status: dto.status,
                }),
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.accidentalReport.delete({
            where: { id },
        });
    }
}