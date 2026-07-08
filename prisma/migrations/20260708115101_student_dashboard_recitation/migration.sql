-- CreateEnum
CREATE TYPE "RecitationMode" AS ENUM ('WITH_TAJWEED', 'WITHOUT_TAJWEED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "studentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "unreadMessages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unreadNotifications" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudentCourseProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mode" "RecitationMode" NOT NULL DEFAULT 'WITH_TAJWEED',
    "tajweedColorsOn" BOOLEAN NOT NULL DEFAULT true,
    "highlightMistakes" BOOLEAN NOT NULL DEFAULT false,
    "currentSurah" INTEGER NOT NULL DEFAULT 1,
    "currentAyah" INTEGER NOT NULL DEFAULT 1,
    "selectedReciter" TEXT NOT NULL DEFAULT 'ar.alafasy',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecitationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "mode" "RecitationMode" NOT NULL,
    "accuracyScore" INTEGER,
    "feedback" JSONB,
    "reciterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecitationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCourseProgress_userId_idx" ON "StudentCourseProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourseProgress_userId_courseSlug_key" ON "StudentCourseProgress"("userId", "courseSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RecitationPreference_userId_key" ON "RecitationPreference"("userId");

-- CreateIndex
CREATE INDEX "RecitationAttempt_userId_idx" ON "RecitationAttempt"("userId");

-- AddForeignKey
ALTER TABLE "StudentCourseProgress" ADD CONSTRAINT "StudentCourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourseProgress" ADD CONSTRAINT "StudentCourseProgress_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationPreference" ADD CONSTRAINT "RecitationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationAttempt" ADD CONSTRAINT "RecitationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
