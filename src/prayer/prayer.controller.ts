import {
  Body,
  Controller,
  Delete,
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
import type { User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { PrayerService } from './prayer.service';
import { GetPrayerTimesDto } from './dto/get-prayer-times.dto';
import { UpdateReminderDto, UpsertReminderDto } from './dto/reminder.dto';

@ApiTags('Prayer')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('times')
  getTimes(@Query() query: GetPrayerTimesDto) {
    return this.prayerService.getPrayerTimes(query);
  }

  @Get('reminders')
  getReminders(@GetUser() user: User) {
    return this.prayerService.getReminders(user.id);
  }

  @Post('reminders')
  upsertReminder(@GetUser() user: User, @Body() dto: UpsertReminderDto) {
    return this.prayerService.upsertReminder(user.id, dto);
  }

  @Patch('reminders/:id')
  updateReminder(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.prayerService.updateReminder(user.id, id, dto);
  }

  @Delete('reminders/:id')
  deleteReminder(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.prayerService.deleteReminder(user.id, id);
  }
}
