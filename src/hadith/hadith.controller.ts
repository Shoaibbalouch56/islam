import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { HadithService } from './hadith.service';
import { ListHadithDto } from './dto/list-hadith.dto';
import { CreateHadithBookmarkDto } from './dto/create-hadith-bookmark.dto';

@ApiTags('Hadith')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('hadith')
export class HadithController {
  constructor(private readonly hadithService: HadithService) {}

  @Get('collections')
  getCollections() {
    return this.hadithService.getCollections();
  }

  @Get('topics')
  getTopics() {
    return this.hadithService.getTopics();
  }

  @Get('daily')
  getDaily() {
    return this.hadithService.getDaily();
  }

  @Get('bookmarks')
  getBookmarks(@GetUser() user: User) {
    return this.hadithService.getBookmarks(user.id);
  }

  @Post('bookmarks')
  addBookmark(@GetUser() user: User, @Body() dto: CreateHadithBookmarkDto) {
    return this.hadithService.addBookmark(user.id, dto.hadithId);
  }

  @Delete('bookmarks/:id')
  removeBookmark(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.hadithService.removeBookmark(user.id, id);
  }

  @Get()
  list(@Query() query: ListHadithDto) {
    return this.hadithService.list(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.hadithService.getById(id);
  }
}
