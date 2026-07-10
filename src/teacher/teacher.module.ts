import { Module } from '@nestjs/common';
import { TeacherClassesController } from './classes/teacher-classes.controller';
import { TeacherClassesService } from './classes/teacher-classes.service';
import { TeacherDashboardController } from './dashboard/teacher-dashboard.controller';
import { TeacherDashboardService } from './dashboard/teacher-dashboard.service';
import { TeacherRatingController } from './rating/teacher-rating.controller';
import { TeacherRatingService } from './rating/teacher-rating.service';
import { TeacherScheduleController } from './schedule/teacher-schedule.controller';
import { TeacherScheduleService } from './schedule/teacher-schedule.service';

@Module({
  controllers: [
    TeacherDashboardController,
    TeacherClassesController,
    TeacherScheduleController,
    TeacherRatingController,
  ],
  providers: [
    TeacherDashboardService,
    TeacherClassesService,
    TeacherScheduleService,
    TeacherRatingService,
  ],
})
export class TeacherModule {}
