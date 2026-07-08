import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { HomeService } from './home.service';
import { HomeQueryDto } from './dto/home-query.dto';
import { getDailyContent } from './daily.data';

@ApiTags('Home')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getDashboard(@GetUser() user: User, @Query() query: HomeQueryDto) {
    return this.homeService.getDashboard(user, query);
  }

  @Get('daily-hadith')
  getDailyHadith() {
    return getDailyContent();
  }
}
