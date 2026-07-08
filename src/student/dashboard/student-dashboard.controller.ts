import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { GetUser } from '../../auth/get-user.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { DashboardSearchDto } from '../dto/dashboard-search.dto';
import { StudentDashboardService } from './student-dashboard.service';

@ApiTags('Student Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/dashboard')
export class StudentDashboardController {
  constructor(private readonly dashboardService: StudentDashboardService) {}

  @Get()
  getDashboard(@GetUser() user: User, @Query() query: DashboardSearchDto) {
    return this.dashboardService.getDashboard(user, query);
  }
}
