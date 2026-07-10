import { Injectable } from '@nestjs/common';
import type { RecitationMode } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PortalContentService {
  constructor(private prisma: PrismaService) {}

  async getDailyQuote(date = new Date()) {
    const quotes = await this.prisma.dailyQuote.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (!quotes.length) {
      return {
        text: 'The best among you are those who learn the Quran and teach it.',
        source: 'Sahih al-Bukhari 5027',
      };
    }
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const quote = quotes[dayOfYear % quotes.length];
    return { text: quote.text, source: quote.source };
  }

  async getSetting(key: string, fallback = ''): Promise<string> {
    const row = await this.prisma.appSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  }

  async getSettings(keys: string[]) {
    const rows = await this.prisma.appSetting.findMany({
      where: { key: { in: keys } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return (key: string, fallback = '') => map.get(key) ?? fallback;
  }

  async getTajweedRules() {
    return this.prisma.tajweedRule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, label: true, color: true },
    });
  }

  async getTajweedSegments(surahNumber: number, ayahNumber: number) {
    return this.prisma.tajweedWordSegment.findMany({
      where: { surahNumber, ayahNumber },
      orderBy: { wordOrder: 'asc' },
      include: { rule: true },
    });
  }

  async getRecitationModes() {
    const modes = await this.prisma.recitationModeInfo.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return modes.map((m) => ({
      id: m.mode,
      label: m.label,
      description: m.description,
    }));
  }

  async getRecitationMode(mode: RecitationMode) {
    return this.prisma.recitationModeInfo.findUnique({ where: { mode } });
  }

  async getReciters() {
    return this.prisma.reciter.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        editionId: true,
        name: true,
        arabicName: true,
        style: true,
        avatar: true,
      },
    });
  }

  async getDefaultReciterEditionId() {
    const reciter = await this.prisma.reciter.findFirst({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { editionId: true },
    });
    return reciter?.editionId ?? 'ar.alafasy';
  }

  async validateReciterEditionId(editionId: string) {
    const reciter = await this.prisma.reciter.findUnique({
      where: { editionId },
    });
    return reciter?.isActive ? reciter : null;
  }
}
