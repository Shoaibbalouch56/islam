import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { QuranService } from './quran.service';
import { DEFAULT_RECITER, DEFAULT_TRANSLATION } from './quran.constants';
import { GetSurahQueryDto } from './dto/get-surah-query.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ReadingProgressDto } from './dto/reading-progress.dto';

@ApiTags('Quran')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quran')
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  @Get('surahs')
  getSurahs() {
    return this.quranService.getSurahs();
  }

  @Get('reciters')
  getReciters() {
    return this.quranService.getReciters();
  }

  @Get('translations')
  getTranslations() {
    return this.quranService.getTranslations();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.quranService.searchSurahs(q ?? '');
  }

  @Get('bookmarks')
  getBookmarks(@GetUser() user: User) {
    return this.quranService.getBookmarks(user.id);
  }

  @Post('bookmarks')
  addBookmark(@GetUser() user: User, @Body() dto: CreateBookmarkDto) {
    return this.quranService.addBookmark(user.id, dto);
  }

  @Delete('bookmarks/:id')
  removeBookmark(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quranService.removeBookmark(user.id, id);
  }

  @Get('reading-progress')
  getReadingProgress(@GetUser() user: User) {
    return this.quranService.getReadingProgress(user.id);
  }

  @Put('reading-progress')
  saveReadingProgress(
    @GetUser() user: User,
    @Body() dto: ReadingProgressDto,
  ) {
    return this.quranService.saveReadingProgress(
      user.id,
      dto.surahNumber,
      dto.ayahNumber,
    );
  }

  @Get('surahs/:number')
  getSurah(
    @Param('number', ParseIntPipe) number: number,
    @Query() query: GetSurahQueryDto,
  ) {
    return this.quranService.getSurah(
      number,
      query.translation ?? DEFAULT_TRANSLATION,
      query.reciter ?? DEFAULT_RECITER,
    );
  }
}
