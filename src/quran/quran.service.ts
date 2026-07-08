import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  ALQURAN_API_BASE,
  ARABIC_EDITION,
  DEFAULT_RECITER,
  DEFAULT_TRANSLATION,
  FEATURED_RECITERS,
  TRANSLATIONS,
} from './quran.constants';

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  audio?: string;
  audioSecondary?: string[];
}

interface ApiEdition {
  ayahs: ApiAyah[];
  edition: { identifier: string };
}

@Injectable()
export class QuranService {
  private surahListCache: SurahMeta[] | null = null;
  private readonly surahDetailCache = new Map<string, unknown>();

  constructor(private prisma: PrismaService) {}

  private async fetchJson<T>(url: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
    } catch (err) {
      console.error('[QuranService] fetch failed:', url, err);
      throw new BadGatewayException('Failed to reach Quran data provider');
    }
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException('Requested Quran resource not found');
      }
      console.error('[QuranService] non-ok response:', url, res.status);
      throw new BadGatewayException('Quran data provider returned an error');
    }
    const body = (await res.json()) as { code: number; data: T };
    return body.data;
  }

  async getSurahs() {
    if (!this.surahListCache) {
      this.surahListCache = await this.fetchJson<SurahMeta[]>(
        `${ALQURAN_API_BASE}/surah`,
      );
    }
    return this.surahListCache.map((s) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      meaning: s.englishNameTranslation,
      ayahs: s.numberOfAyahs,
      revelationType: s.revelationType,
    }));
  }

  async searchSurahs(query: string) {
    const all = await this.getSurahs();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.name.includes(query) ||
        String(s.number) === q,
    );
  }

  getReciters() {
    return FEATURED_RECITERS;
  }

  getTranslations() {
    return TRANSLATIONS;
  }

  async getSurah(number: number, translation: string, reciter: string) {
    if (number < 1 || number > 114) {
      throw new NotFoundException('Surah number must be between 1 and 114');
    }

    const cacheKey = `${number}:${translation}:${reciter}`;
    const cached = this.surahDetailCache.get(cacheKey);
    if (cached) return cached;

    const editions = [ARABIC_EDITION, translation, reciter].join(',');
    const data = await this.fetchJson<ApiEdition[]>(
      `${ALQURAN_API_BASE}/surah/${number}/editions/${editions}`,
    );

    const arabic = data.find((e) => e.edition.identifier === ARABIC_EDITION);
    const trans = data.find((e) => e.edition.identifier === translation);
    const audio = data.find((e) => e.edition.identifier === reciter);

    if (!arabic) {
      throw new BadGatewayException('Arabic text unavailable for this surah');
    }

    const meta = (await this.getSurahs()).find((s) => s.number === number);

    const ayahs = arabic.ayahs.map((a, i) => ({
      numberInSurah: a.numberInSurah,
      globalNumber: a.number,
      arabic: a.text,
      translation: trans?.ayahs[i]?.text ?? null,
      audio: audio?.ayahs[i]?.audio ?? null,
      juz: a.juz,
      page: a.page,
    }));

    const result = {
      number,
      name: meta?.name ?? '',
      englishName: meta?.englishName ?? '',
      meaning: meta?.meaning ?? '',
      revelationType: meta?.revelationType ?? '',
      ayahCount: ayahs.length,
      translationEdition: translation,
      reciterEdition: reciter,
      ayahs,
    };

    this.surahDetailCache.set(cacheKey, result);
    return result;
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addBookmark(
    userId: number,
    data: {
      surahNumber: number;
      ayahNumber: number;
      surahName?: string;
      note?: string;
    },
  ) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber: data.surahNumber,
          ayahNumber: data.ayahNumber,
        },
      },
      update: { surahName: data.surahName, note: data.note },
      create: { userId, ...data },
    });
  }

  async removeBookmark(userId: number, id: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.prisma.bookmark.delete({ where: { id } });
    return { message: 'Bookmark removed' };
  }

  async getReadingProgress(userId: number) {
    return this.prisma.readingProgress.findUnique({ where: { userId } });
  }

  async saveReadingProgress(
    userId: number,
    surahNumber: number,
    ayahNumber: number,
  ) {
    return this.prisma.readingProgress.upsert({
      where: { userId },
      update: { surahNumber, ayahNumber },
      create: { userId, surahNumber, ayahNumber },
    });
  }
}
