import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TeacherDashboardService } from '../dashboard/teacher-dashboard.service';

@Injectable()
export class TeacherRatingService {
  constructor(
    private prisma: PrismaService,
    private dashboardService: TeacherDashboardService,
  ) {}

  async getRating(teacherId: number) {
    const profile = await this.dashboardService.ensureProfile(teacherId);

    const reviews = await this.prisma.teacherReview.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        student: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    return {
      rating: profile.rating,
      ratingCount: profile.ratingCount,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        student: {
          id: r.student.id,
          fullName: r.student.fullName,
          avatar: r.student.avatar,
        },
      })),
    };
  }
}
