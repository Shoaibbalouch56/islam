import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateTeacherScheduleDto } from '../dto/update-teacher-schedule.dto';
import { TeacherDashboardService } from '../dashboard/teacher-dashboard.service';

@Injectable()
export class TeacherScheduleService {
  constructor(
    private prisma: PrismaService,
    private dashboardService: TeacherDashboardService,
  ) {}

  async getSchedule(userId: number) {
    const profile = await this.dashboardService.ensureProfile(userId);

    const timeslots = await this.prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        label: true,
        startTime: true,
        endTime: true,
      },
    });

    return {
      timezone: profile.timezone,
      selectedSlugs: profile.timeslotSlugs,
      timeslots: timeslots.map((slot) => ({
        ...slot,
        selected: profile.timeslotSlugs.includes(slot.slug),
      })),
    };
  }

  async updateSchedule(userId: number, dto: UpdateTeacherScheduleDto) {
    await this.dashboardService.ensureProfile(userId);

    const valid = await this.prisma.timeSlot.findMany({
      where: { slug: { in: dto.timeslotSlugs }, isActive: true },
      select: { slug: true },
    });
    const validSlugs = valid.map((t) => t.slug);
    const invalid = dto.timeslotSlugs.filter((s) => !validSlugs.includes(s));
    if (invalid.length) {
      throw new BadRequestException(
        `Invalid timeslot(s): ${invalid.join(', ')}`,
      );
    }

    const profile = await this.prisma.teacherProfile.update({
      where: { userId },
      data: {
        timeslotSlugs: validSlugs,
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      },
    });

    return this.getSchedule(userId);
  }
}
