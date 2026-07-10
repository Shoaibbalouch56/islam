import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ClassStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TeacherClassesQueryDto } from '../dto/teacher-query.dto';
import { mapClassCard } from '../teacher.utils';

@Injectable()
export class TeacherClassesService {
  constructor(private prisma: PrismaService) {}

  private enrollmentInclude = {
    enrollments: {
      include: {
        student: { select: { id: true, fullName: true, avatar: true } },
      },
    },
  };

  private statusFilter(status?: string): ClassStatus[] | undefined {
    switch (status) {
      case 'pending':
        return ['PENDING'];
      case 'completed':
        return ['COMPLETED'];
      case 'upcoming':
        return ['ACCEPTED', 'UPCOMING', 'LIVE'];
      default:
        return undefined;
    }
  }

  async getClasses(teacherId: number, query: TeacherClassesQueryDto) {
    const statusFilter = this.statusFilter(query.status);
    const where = {
      teacherId,
      ...(statusFilter ? { status: { in: statusFilter } } : {}),
    };

    const [pendingCount, classes] = await Promise.all([
      this.prisma.teacherClass.count({
        where: { teacherId, status: 'PENDING' },
      }),
      this.prisma.teacherClass.findMany({
        where,
        orderBy: [{ scheduledDate: 'desc' }, { startTime: 'asc' }],
        include: this.enrollmentInclude,
      }),
    ]);

    const pendingClasses = classes
      .filter((c) => c.status === 'PENDING')
      .map(mapClassCard);
    const completedClasses = classes
      .filter((c) => c.status === 'COMPLETED')
      .map(mapClassCard);
    const upcomingClasses = classes
      .filter((c) => ['ACCEPTED', 'UPCOMING', 'LIVE'].includes(c.status))
      .map(mapClassCard);

    const activeFilter = query.status ?? 'all';

    return {
      filter: activeFilter,
      filters: ['all', 'pending', 'completed'],
      pendingSummary: {
        count: pendingCount,
        message:
          pendingCount > 0
            ? `${pendingCount} class${pendingCount === 1 ? '' : 'es'} awaiting your response`
            : null,
      },
      counts: {
        all: classes.length,
        pending: pendingClasses.length,
        completed: completedClasses.length,
        upcoming: upcomingClasses.length,
      },
      pendingClasses:
        activeFilter === 'all' || activeFilter === 'pending'
          ? pendingClasses
          : [],
      completedClasses:
        activeFilter === 'all' || activeFilter === 'completed'
          ? {
              count: completedClasses.length,
              classes: completedClasses,
            }
          : { count: completedClasses.length, classes: [] },
      upcomingClasses:
        activeFilter === 'upcoming' ? upcomingClasses : undefined,
      classes:
        activeFilter === 'all'
          ? classes.map(mapClassCard)
          : activeFilter === 'pending'
            ? pendingClasses
            : activeFilter === 'completed'
              ? completedClasses
              : upcomingClasses,
    };
  }

  async acceptClass(teacherId: number, classId: number) {
    const cls = await this.findOwnedClass(teacherId, classId);
    if (cls.status !== 'PENDING') {
      throw new BadRequestException('Only pending classes can be accepted');
    }

    const updated = await this.prisma.teacherClass.update({
      where: { id: classId },
      data: { status: 'ACCEPTED' },
      include: this.enrollmentInclude,
    });

    return {
      message: 'Class accepted successfully',
      class: mapClassCard(updated),
    };
  }

  async rejectClass(teacherId: number, classId: number) {
    const cls = await this.findOwnedClass(teacherId, classId);
    if (cls.status !== 'PENDING') {
      throw new BadRequestException('Only pending classes can be rejected');
    }

    const updated = await this.prisma.teacherClass.update({
      where: { id: classId },
      data: { status: 'REJECTED' },
      include: this.enrollmentInclude,
    });

    return {
      message: 'Class rejected',
      class: mapClassCard(updated),
    };
  }

  async startLiveClass(teacherId: number, classId: number) {
    const cls = await this.findOwnedClass(teacherId, classId);
    if (!['ACCEPTED', 'UPCOMING', 'LIVE'].includes(cls.status)) {
      throw new BadRequestException(
        'Only accepted or upcoming classes can be started',
      );
    }

    const updated = await this.prisma.teacherClass.update({
      where: { id: classId },
      data: { status: 'LIVE', startedAt: new Date() },
      include: this.enrollmentInclude,
    });

    return {
      message: 'Live class started',
      class: mapClassCard(updated),
      liveSession: {
        classId: updated.id,
        startedAt: updated.startedAt,
        joinUrl: null,
      },
    };
  }

  async completeClass(teacherId: number, classId: number) {
    const cls = await this.findOwnedClass(teacherId, classId);
    if (!['LIVE', 'ACCEPTED', 'UPCOMING'].includes(cls.status)) {
      throw new BadRequestException('This class cannot be marked completed');
    }

    const updated = await this.prisma.teacherClass.update({
      where: { id: classId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: this.enrollmentInclude,
    });

    return {
      message: 'Class marked as completed',
      class: mapClassCard(updated),
    };
  }

  private async findOwnedClass(teacherId: number, classId: number) {
    const cls = await this.prisma.teacherClass.findFirst({
      where: { id: classId, teacherId },
      include: this.enrollmentInclude,
    });
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    return cls;
  }
}
