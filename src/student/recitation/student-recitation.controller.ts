import {
  Body,
  Controller,
  Get,
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
import { AnalyzeRecitationDto } from '../dto/analyze-recitation.dto';
import { UpdateRecitationSettingsDto } from '../dto/update-recitation-settings.dto';
import { StudentRecitationService } from './student-recitation.service';

@ApiTags('Student Recitation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/recitation')
export class StudentRecitationController {
  constructor(private readonly recitationService: StudentRecitationService) {}

  @Get('settings')
  getSettings(@GetUser() user: User) {
    return this.recitationService.getSettings(user.id);
  }

  @Patch('settings')
  updateSettings(
    @GetUser() user: User,
    @Body() dto: UpdateRecitationSettingsDto,
  ) {
    return this.recitationService.updateSettings(user.id, dto);
  }

  @Get('tajweed-rules')
  getTajweedRules() {
    return this.recitationService.getTajweedRules();
  }

  @Get('reciters')
  getReciters() {
    return this.recitationService.getReciters();
  }

  @Get('verse')
  getVerse(
    @GetUser() user: User,
    @Query('surah') surah?: string,
    @Query('ayah') ayah?: string,
  ) {
    if (surah && ayah) {
      return this.recitationService.getVerse(
        user.id,
        parseInt(surah, 10),
        parseInt(ayah, 10),
      );
    }
    return this.recitationService.getCurrentVerse(user.id);
  }

  @Post('next')
  nextVerse(@GetUser() user: User) {
    return this.recitationService.advanceVerse(user.id);
  }

  @Post('analyze')
  analyze(
    @GetUser() user: User,
    @Body() dto: AnalyzeRecitationDto,
  ) {
    return this.recitationService.analyzeRecitation(user.id, dto);
  }

  @Get('practice')
  getPracticeScreen(@GetUser() user: User) {
    return this.recitationService.getPracticeScreen(user.id);
  }

  @Get('feedback')
  getFeedbackScreen(@GetUser() user: User) {
    return this.recitationService.getFeedbackScreen(user.id);
  }

  @Get('history')
  getHistory(@GetUser() user: User) {
    return this.recitationService.getHistory(user.id);
  }
}
