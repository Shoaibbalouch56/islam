import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrayerModule } from '../prayer/prayer.module';
import { QuranModule } from '../quran/quran.module';

@Module({
  imports: [PrayerModule, QuranModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
