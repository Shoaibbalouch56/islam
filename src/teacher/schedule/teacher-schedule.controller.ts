import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { GetUser } from '../../auth/get-user.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { UpdateTeacherScheduleDto } from '../dto/update-teacher-schedule.dto';
import { TeacherScheduleService } from './teacher-schedule.service';

@ApiTags('Teacher Schedule')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/schedule')
export class TeacherScheduleController {
  constructor(private readonly scheduleService: TeacherScheduleService) {}

  @Get()
  getSchedule(@GetUser() user: User) {
    return this.scheduleService.getSchedule(user.id);
  }

  @Patch()
  updateSchedule(
    @GetUser() user: User,
    @Body() dto: UpdateTeacherScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(user.id, dto);
  }
}
