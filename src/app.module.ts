import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from 'prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { HadithModule } from './hadith/hadith.module';
import { HomeModule } from './home/home.module';
import { MailerModule } from './mailer/mailer.module';
import { PrayerModule } from './prayer/prayer.module';
import { QiblaModule } from './qibla/qibla.module';
import { QuranModule } from './quran/quran.module';
import { UsersModule } from './users/users.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    MailerModule,
    AuthModule,
    UsersModule,
    QuranModule,
    PrayerModule,
    HomeModule,
    QiblaModule,
    HadithModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
