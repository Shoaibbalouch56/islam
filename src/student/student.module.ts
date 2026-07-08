import { Module } from '@nestjs/common';
import { QuranModule } from '../quran/quran.module';
import { StudentDashboardController } from './dashboard/student-dashboard.controller';
import { StudentDashboardService } from './dashboard/student-dashboard.service';
import { StudentRecitationController } from './recitation/student-recitation.controller';
import { StudentRecitationService } from './recitation/student-recitation.service';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [QuranModule],
  controllers: [
    StudentController,
    StudentDashboardController,
    StudentRecitationController,
  ],
  providers: [StudentService, StudentDashboardService, StudentRecitationService],
})
export class StudentModule {}