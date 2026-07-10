import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PortalContentService } from '../../portal-content/portal-content.service';
import { DashboardListQueryDto } from '../dto/dashboard-list-query.dto';
import { DashboardSearchDto } from '../dto/dashboard-search.dto';

@Injectable()
export class StudentDashboardService {
  constructor(
    private prisma: PrismaService,
    private portalContent: PortalContentService,
  ) {}

  async getDashboard(user: User, query: DashboardSearchDto) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const [dailyQuote, settings] = await Promise.all([
      this.portalContent.getDailyQuote(),
      this.portalContent.getSettings([
        'student.dashboard.tagline',
        'student.dashboard.search_placeholder',
      ]),
    ]);

    const categories = await this.prisma.course.findMany({
      where: { isDashboardCategory: true, isActive: true },
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
      screen: 'student_dashboard',
      welcome: {
        greeting: `Welcome, ${firstName}!`,
        tagline: settings(
          'student.dashboard.tagline',
          'Journey of knowledge and faith',
        ),
        avatar: user.avatar,
      },
      notifications: {
        unreadMessages: profile?.unreadMessages ?? 0,
        unreadAlerts: profile?.unreadNotifications ?? 0,
      },
      dailyQuote,
      search: {
        placeholder: settings(
          'student.dashboard.search_placeholder',
          'Search courses, surahs, topics…',
        ),
        query: query.q ?? null,
      },
      categories: categories.map((c) => ({
        slug: c.slug,
        title: c.title,
        icon: c.icon,
        thumbnail: c.thumbnail,
      })),
      continueLearning: {
        title: 'Continue Learning',
        seeAll: true,
        items: continueLearning.map((p) => ({
          slug: p.course.slug,
          title: p.course.title,
          thumbnail: p.course.thumbnail,
          description: p.course.description,
          progressPercent: p.progressPercent,
          lastAccessedAt: p.lastAccessedAt,
          actionLabel: 'Continue',
        })),
      },
      featuredCourses: {
        title: 'Featured Course',
        seeAll: true,
        items: featuredCourses.map((c) => ({
          slug: c.slug,
          title: c.title,
          description: c.description,
          thumbnail: c.thumbnail,
          level: c.level,
          rating: c.rating,
          studentCount: c.studentCount,
          studentCountLabel: this.formatStudentCount(c.studentCount),
        })),
      },
    };
  }

  async getContinueLearning(userId: number, query: DashboardListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(query.q
        ? {
            course: {
              OR: [
                { title: { contains: query.q, mode: 'insensitive' as const } },
                {
                  description: {
                    contains: query.q,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.studentCourseProgress.count({ where }),
      this.prisma.studentCourseProgress.findMany({
        where,
        orderBy: { lastAccessedAt: 'desc' },
        skip,
        take: limit,
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
      }),
    ]);

    return {
      screen: 'continue_learning',
      total,
      page,
      limit,
      items: items.map((p) => ({
        slug: p.course.slug,
        title: p.course.title,
        thumbnail: p.course.thumbnail,
        description: p.course.description,
        progressPercent: p.progressPercent,
        lastAccessedAt: p.lastAccessedAt,
        actionLabel: 'Continue',
      })),
    };
  }

  async getFeaturedCourses(query: DashboardListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = query.q
      ? {
          isFeatured: true,
          isActive: true,
          OR: [
            { title: { contains: query.q, mode: 'insensitive' as const } },
            { description: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : { isFeatured: true, isActive: true };

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
        select: {
          slug: true,
          title: true,
          description: true,
          thumbnail: true,
          level: true,
          rating: true,
          studentCount: true,
        },
      }),
    ]);

    return {
      screen: 'featured_courses',
      total,
      page,
      limit,
      items: courses.map((c) => ({
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

      await this.prisma.studentCourseProgress.upsert({
        where: { userId_courseSlug: { userId, courseSlug: slug } },
        create: {
          userId,
          courseSlug: slug,
          progressPercent: course.defaultProgressPercent,
        },
        update: {},
      });
    }
  }
}
