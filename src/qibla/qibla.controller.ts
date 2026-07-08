import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { QiblaService } from './qibla.service';
import { QiblaQueryDto } from './dto/qibla-query.dto';
import { SaveLocationDto } from './dto/save-location.dto';

@ApiTags('Qibla')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('qibla')
export class QiblaController {
  constructor(private readonly qiblaService: QiblaService) {}

  @Get()
  getQibla(@GetUser() user: User, @Query() query: QiblaQueryDto) {
    return this.qiblaService.getQibla(user.id, query.lat, query.lng);
  }

  @Post('location')
  saveLocation(@GetUser() user: User, @Body() dto: SaveLocationDto) {
    return this.qiblaService.saveLocation(user.id, dto);
  }
}
