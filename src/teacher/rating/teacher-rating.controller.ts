import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { GetUser } from '../../auth/get-user.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { TeacherRatingService } from './teacher-rating.service';

@ApiTags('Teacher Rating')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/rating')
export class TeacherRatingController {
  constructor(private readonly ratingService: TeacherRatingService) {}

  @Get()
  getRating(@GetUser() user: User) {
    return this.ratingService.getRating(user.id);
  }
}
