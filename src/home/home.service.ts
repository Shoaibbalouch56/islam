import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrayerService } from '../prayer/prayer.service';
import { QuranService } from '../quran/quran.service';
import { getDailyContent } from './daily.data';
import { HomeQueryDto } from './dto/home-query.dto';

@Injectable()
export class HomeService {
  constructor(
    private prayerService: PrayerService,
    private quranService: QuranService,
  ) {}

  private greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  async getDashboard(user: User, query: HomeQueryDto) {
    const daily = getDailyContent();

    let prayer: unknown = null;
    if (query.lat !== undefined && query.lng !== undefined) {
      prayer = await this.prayerService.getPrayerTimes({
        lat: query.lat,
        lng: query.lng,
        method: query.method,
        madhab: query.madhab,
        timezone: query.timezone,
      });
    }

    const progress = await this.quranService.getReadingProgress(user.id);

    return {
      greeting: this.greeting(),
      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
      dailyHadith: daily,
      prayer,
      continueReading: progress,
      featuredReciters: this.quranService.getReciters().slice(0, 4),
    };
  }
}
