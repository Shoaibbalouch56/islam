import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { GetUser } from '../../auth/get-user.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { TeacherDashboardQueryDto } from '../dto/teacher-query.dto';
import { TeacherDashboardService } from './teacher-dashboard.service';

@ApiTags('Teacher Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/dashboard')
export class TeacherDashboardController {
  constructor(private readonly dashboardService: TeacherDashboardService) {}

  @Get()
  getDashboard(
    @GetUser() user: User,
    @Query() query: TeacherDashboardQueryDto,
  ) {
    return this.dashboardService.getDashboard(user, query);
  }
}
