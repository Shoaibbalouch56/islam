import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  getDailyHadith,
  HADITH_COLLECTIONS,
  HADITH_TOPICS,
  HADITHS,
  HadithItem,
} from './hadith.data';
import { ListHadithDto } from './dto/list-hadith.dto';

@Injectable()
export class HadithService {
  constructor(private prisma: PrismaService) {}

  getCollections() {
    return HADITH_COLLECTIONS.map((c) => ({
      ...c,
      available: HADITHS.filter((h) => h.collectionId === c.id).length,
    }));
  }

  getTopics() {
    return HADITH_TOPICS;
  }

  getDaily() {
    return getDailyHadith();
  }

  list(dto: ListHadithDto) {
    let items: HadithItem[] = HADITHS;

    if (dto.collection) {
      items = items.filter((h) => h.collectionId === dto.collection);
    }

    if (dto.topic && dto.topic !== 'all') {
      items = items.filter((h) => h.topic === dto.topic);
    }

    if (dto.q) {
      const q = dto.q.trim().toLowerCase();
      items = items.filter(
        (h) =>
          h.english.toLowerCase().includes(q) ||
          h.arabic.includes(dto.q as string) ||
          h.narrator.toLowerCase().includes(q) ||
          h.reference.toLowerCase().includes(q),
      );
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  getById(id: string) {
    const hadith = HADITHS.find((h) => h.id === id);
    if (!hadith) {
      throw new NotFoundException('Hadith not found');
    }
    return hadith;
  }

  async getBookmarks(userId: number) {
    const bookmarks = await this.prisma.hadithBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => ({
      ...b,
      hadith: HADITHS.find((h) => h.id === b.hadithId) ?? null,
    }));
  }

  async addBookmark(userId: number, hadithId: string) {
    const hadith = this.getById(hadithId);
    return this.prisma.hadithBookmark.upsert({
      where: { userId_hadithId: { userId, hadithId } },
      update: {},
      create: { userId, hadithId, collectionId: hadith.collectionId },
    });
  }

  async removeBookmark(userId: number, id: number) {
    const bookmark = await this.prisma.hadithBookmark.findUnique({
      where: { id },
    });
    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.prisma.hadithBookmark.delete({ where: { id } });
    return { message: 'Bookmark removed' };
  }
}
