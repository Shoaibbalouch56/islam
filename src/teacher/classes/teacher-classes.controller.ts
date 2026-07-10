import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { GetUser } from '../../auth/get-user.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { TeacherClassesQueryDto } from '../dto/teacher-query.dto';
import { TeacherClassesService } from './teacher-classes.service';

@ApiTags('Teacher Classes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/classes')
export class TeacherClassesController {
  constructor(private readonly classesService: TeacherClassesService) {}

  @Get()
  getClasses(
    @GetUser() user: User,
    @Query() query: TeacherClassesQueryDto,
  ) {
    return this.classesService.getClasses(user.id, query);
  }

  @Patch(':id/accept')
  acceptClass(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.acceptClass(user.id, id);
  }

  @Patch(':id/reject')
  rejectClass(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.rejectClass(user.id, id);
  }

  @Post(':id/start-live')
  startLiveClass(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.startLiveClass(user.id, id);
  }

  @Post(':id/complete')
  completeClass(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.completeClass(user.id, id);
  }
}
