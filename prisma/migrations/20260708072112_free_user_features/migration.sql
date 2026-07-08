-- CreateEnum
CREATE TYPE "Prayer" AS ENUM ('FAJR', 'SUNRISE', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA');

-- CreateEnum
CREATE TYPE "AlarmSound" AS ENUM ('ADHAN', 'BEEP', 'CHIME', 'SILENT');

-- CreateTable
CREATE TABLE "PrayerReminder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "prayer" "Prayer" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "offsetMinutes" INTEGER NOT NULL DEFAULT 0,
    "alarmSound" "AlarmSound" NOT NULL DEFAULT 'ADHAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "surahName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerReminder_userId_idx" ON "PrayerReminder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerReminder_userId_prayer_key" ON "PrayerReminder"("userId", "prayer");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_surahNumber_ayahNumber_key" ON "Bookmark"("userId", "surahNumber", "ayahNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_key" ON "ReadingProgress"("userId");

-- AddForeignKey
ALTER TABLE "PrayerReminder" ADD CONSTRAINT "PrayerReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
