import { Injectable, NotFoundException } from '@nestjs/common';
import type * as Adhan from 'adhan';
import { Prayer } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  CalculationMethodName,
  GetPrayerTimesDto,
} from './dto/get-prayer-times.dto';
import { UpdateReminderDto, UpsertReminderDto } from './dto/reminder.dto';

@Injectable()
export class PrayerService {
  private adhanModule: typeof Adhan | null = null;

  constructor(private prisma: PrismaService) {}

  private async getAdhan(): Promise<typeof Adhan> {
    if (!this.adhanModule) {
      this.adhanModule = await import('adhan');
    }
    return this.adhanModule;
  }

  private resolveParams(
    adhan: typeof Adhan,
    method?: CalculationMethodName,
  ): Adhan.CalculationParameters {
    const cm = adhan.CalculationMethod;
    switch (method) {
      case 'Egyptian':
        return cm.Egyptian();
      case 'Karachi':
        return cm.Karachi();
      case 'UmmAlQura':
        return cm.UmmAlQura();
      case 'Dubai':
        return cm.Dubai();
      case 'Qatar':
        return cm.Qatar();
      case 'Kuwait':
        return cm.Kuwait();
      case 'MoonsightingCommittee':
        return cm.MoonsightingCommittee();
      case 'Singapore':
        return cm.Singapore();
      case 'Turkey':
        return cm.Turkey();
      case 'Tehran':
        return cm.Tehran();
      case 'NorthAmerica':
        return cm.NorthAmerica();
      case 'MuslimWorldLeague':
      default:
        return cm.MuslimWorldLeague();
    }
  }

  private formatTime(date: Date, timezone?: string): string {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    }
  }

  async getPrayerTimes(dto: GetPrayerTimesDto) {
    const adhan = await this.getAdhan();
    const coordinates = new adhan.Coordinates(dto.lat, dto.lng);
    const params = this.resolveParams(adhan, dto.method);
    params.madhab =
      dto.madhab === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;

    const date = dto.date ? new Date(dto.date) : new Date();
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
    const sunnah = new adhan.SunnahTimes(prayerTimes);

    const entries: { key: Prayer; label: string; time: Date }[] = [
      { key: Prayer.FAJR, label: 'Fajr', time: prayerTimes.fajr },
      { key: Prayer.SUNRISE, label: 'Sunrise', time: prayerTimes.sunrise },
      { key: Prayer.DHUHR, label: 'Dhuhr', time: prayerTimes.dhuhr },
      { key: Prayer.ASR, label: 'Asr', time: prayerTimes.asr },
      { key: Prayer.MAGHRIB, label: 'Maghrib', time: prayerTimes.maghrib },
      { key: Prayer.ISHA, label: 'Isha', time: prayerTimes.isha },
    ];

    const now = new Date();
    const nextRaw = prayerTimes.nextPrayer();
    const currentRaw = prayerTimes.currentPrayer();

    const timings = entries.map((e) => ({
      prayer: e.key,
      label: e.label,
      time: this.formatTime(e.time, dto.timezone),
      iso: e.time.toISOString(),
    }));

    const nextTime =
      nextRaw && nextRaw !== 'none' ? prayerTimes.timeForPrayer(nextRaw) : null;
    const minutesToNext = nextTime
      ? Math.max(0, Math.round((nextTime.getTime() - now.getTime()) / 60000))
      : null;

    return {
      date: date.toISOString().slice(0, 10),
      coordinates: { lat: dto.lat, lng: dto.lng },
      method: dto.method ?? 'MuslimWorldLeague',
      madhab: dto.madhab ?? 'shafi',
      timezone: dto.timezone ?? null,
      timings,
      current: currentRaw && currentRaw !== 'none' ? currentRaw : null,
      next:
        nextRaw && nextRaw !== 'none'
          ? {
              prayer: nextRaw,
              time: nextTime ? this.formatTime(nextTime, dto.timezone) : null,
              iso: nextTime ? nextTime.toISOString() : null,
              minutesRemaining: minutesToNext,
            }
          : null,
      sunnah: {
        middleOfTheNight: this.formatTime(
          sunnah.middleOfTheNight,
          dto.timezone,
        ),
        lastThirdOfTheNight: this.formatTime(
          sunnah.lastThirdOfTheNight,
          dto.timezone,
        ),
      },
    };
  }

  getReminders(userId: number) {
    return this.prisma.prayerReminder.findMany({
      where: { userId },
      orderBy: { prayer: 'asc' },
    });
  }

  upsertReminder(userId: number, dto: UpsertReminderDto) {
    return this.prisma.prayerReminder.upsert({
      where: { userId_prayer: { userId, prayer: dto.prayer } },
      update: {
        enabled: dto.enabled,
        offsetMinutes: dto.offsetMinutes,
        alarmSound: dto.alarmSound,
      },
      create: {
        userId,
        prayer: dto.prayer,
        enabled: dto.enabled ?? true,
        offsetMinutes: dto.offsetMinutes ?? 0,
        alarmSound: dto.alarmSound ?? 'ADHAN',
      },
    });
  }

  async updateReminder(userId: number, id: number, dto: UpdateReminderDto) {
    const reminder = await this.prisma.prayerReminder.findUnique({
      where: { id },
    });
    if (!reminder || reminder.userId !== userId) {
      throw new NotFoundException('Reminder not found');
    }
    return this.prisma.prayerReminder.update({
      where: { id },
      data: dto,
    });
  }

  async deleteReminder(userId: number, id: number) {
    const reminder = await this.prisma.prayerReminder.findUnique({
      where: { id },
    });
    if (!reminder || reminder.userId !== userId) {
      throw new NotFoundException('Reminder not found');
    }
    await this.prisma.prayerReminder.delete({ where: { id } });
    return { message: 'Reminder deleted' };
  }
}
