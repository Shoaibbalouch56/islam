import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { getDailyContent } from '../../home/daily.data';
import { DashboardSearchDto } from '../dto/dashboard-search.dto';

const CATEGORY_SLUGS = ['nazra-quran', 'hifz-program', 'tajweed-rules'];

@Injectable()
export class StudentDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(user: User, query: DashboardSearchDto) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const dailyQuote = getDailyContent();

    const categories = await this.prisma.course.findMany({
      where: { slug: { in: CATEGORY_SLUGS }, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        title: true,
        icon: true,
        thumbnail: true,
      },
    });

    const continueLearning = await this.prisma.studentCourseProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastAccessedAt: 'desc' },
      take: 10,
      include: {
        course: {
          select: {
            slug: true,
            title: true,
            thumbnail: true,
            description: true,
          },
        },
      },
    });

    const featuredWhere = query.q
      ? {
          isFeatured: true,
          isActive: true,
          OR: [
            { title: { contains: query.q, mode: 'insensitive' as const } },
            { description: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : { isFeatured: true, isActive: true };

    const featuredCourses = await this.prisma.course.findMany({
      where: featuredWhere,
      orderBy: { sortOrder: 'asc' },
      take: 10,
      select: {
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        level: true,
        rating: true,
        studentCount: true,
      },
    });

    const firstName = user.fullName?.split(' ')[0] ?? 'Student';

    return {
      welcome: {
        greeting: `Welcome, ${firstName}!`,
        tagline: 'Journey of knowledge and faith',
        avatar: user.avatar,
      },
      notifications: {
        unreadMessages: profile?.unreadMessages ?? 0,
        unreadAlerts: profile?.unreadNotifications ?? 0,
      },
      dailyQuote: {
        text: dailyQuote.text,
        source: dailyQuote.source,
      },
      search: {
        placeholder: 'Search courses, surahs, topics…',
        query: query.q ?? null,
      },
      categories: categories.map((c) => ({
        slug: c.slug,
        title: c.title,
        icon: c.icon,
        thumbnail: c.thumbnail,
      })),
      continueLearning: continueLearning.map((p) => ({
        slug: p.course.slug,
        title: p.course.title,
        thumbnail: p.course.thumbnail,
        description: p.course.description,
        progressPercent: p.progressPercent,
        lastAccessedAt: p.lastAccessedAt,
      })),
      featuredCourses: featuredCourses.map((c) => ({
        slug: c.slug,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        level: c.level,
        rating: c.rating,
        studentCount: c.studentCount,
        studentCountLabel: this.formatStudentCount(c.studentCount),
      })),
    };
  }

  private formatStudentCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K students`;
    }
    return `${count} students`;
  }

  async seedProgressForCourses(userId: number, courseSlugs: string[]) {
    for (const slug of courseSlugs) {
      const course = await this.prisma.course.findUnique({
        where: { slug },
      });
      if (!course) continue;

      const defaultProgress =
        slug === 'basic-islamic-studies'
          ? 44
          : slug === 'nazra-quran'
            ? 65
            : 0;

      await this.prisma.studentCourseProgress.upsert({
        where: { userId_courseSlug: { userId, courseSlug: slug } },
        create: {
          userId,
          courseSlug: slug,
          progressPercent: defaultProgress,
        },
        update: {},
      });
    }
  }
}
