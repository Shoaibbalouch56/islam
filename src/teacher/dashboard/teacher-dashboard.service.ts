import { Injectable } from '@nestjs/common';
import type { ClassStatus, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { getDailyContent } from '../../home/daily.data';
import { TeacherDashboardQueryDto } from '../dto/teacher-query.dto';
import { mapClassCard, TEACHER_QUICK_LINKS } from '../teacher.utils';

@Injectable()
export class TeacherDashboardService {
  constructor(private prisma: PrismaService) {}

  async ensureProfile(userId: number) {
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getDashboard(user: User, query: TeacherDashboardQueryDto) {
    const profile = await this.ensureProfile(user.id);
    const dailyQuote = getDailyContent();
    const firstName = user.fullName?.split(' ')[0] ?? 'Teacher';

    const upcomingStatuses: ClassStatus[] = ['ACCEPTED', 'UPCOMING', 'LIVE'];
    const upcomingWhere = {
      teacherId: user.id,
      status: { in: upcomingStatuses },
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              { description: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [pendingCount, upcomingClasses, totalClasses, completedCount] =
      await Promise.all([
        this.prisma.teacherClass.count({
          where: { teacherId: user.id, status: 'PENDING' },
        }),
        this.prisma.teacherClass.findMany({
          where: upcomingWhere,
          orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
          take: 10,
          include: {
            enrollments: {
              include: {
                student: { select: { id: true, fullName: true, avatar: true } },
              },
            },
          },
        }),
        this.prisma.teacherClass.count({ where: { teacherId: user.id } }),
        this.prisma.teacherClass.count({
          where: { teacherId: user.id, status: 'COMPLETED' },
        }),
      ]);

    return {
      welcome: {
        greeting: `Welcome, ${firstName}!`,
        tagline: 'Journey of knowledge and faith',
        avatar: user.avatar,
      },
      notifications: {
        unreadMessages: profile.unreadMessages,
        unreadAlerts: profile.unreadNotifications,
      },
      dailyQuote: {
        text: dailyQuote.text,
        source: dailyQuote.source,
      },
      search: {
        placeholder: 'Search classes, students, subjects…',
        query: query.q ?? null,
      },
      teacherDashboard: {
        title: 'Teacher Dashboard',
        quickLinks: TEACHER_QUICK_LINKS.map((link) => ({
          ...link,
          summary:
            link.id === 'my-classes'
              ? { totalClasses, pendingCount, completedCount }
              : link.id === 'my-rating'
                ? {
                    rating: profile.rating,
                    ratingCount: profile.ratingCount,
                  }
                : {
                    timeslots: profile.timeslotSlugs.length,
                  },
        })),
      },
      pendingSummary: {
        count: pendingCount,
        message:
          pendingCount > 0
            ? `${pendingCount} class${pendingCount === 1 ? '' : 'es'} awaiting your response`
            : null,
      },
      upcomingClasses: upcomingClasses.map((cls) => ({
        ...mapClassCard(cls),
        actionLabel: cls.status === 'LIVE' ? 'Join Live Class' : 'Start Live Class',
      })),
    };
  }
}
