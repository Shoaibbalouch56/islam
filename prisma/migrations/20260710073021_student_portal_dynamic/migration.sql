-- CreateEnum
CREATE TYPE "FeedbackDemoStatus" AS ENUM ('CORRECT', 'NEEDS_WORK', 'MISTAKE');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "defaultProgressPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isDashboardCategory" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DailyQuote" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "TajweedRule" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TajweedRule_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "TajweedWordSegment" (
    "id" SERIAL NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "wordOrder" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "ruleCode" TEXT,
    "demoStatus" "FeedbackDemoStatus",

    CONSTRAINT "TajweedWordSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationModeInfo" (
    "mode" "RecitationMode" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecitationModeInfo_pkey" PRIMARY KEY ("mode")
);

-- CreateTable
CREATE TABLE "Reciter" (
    "id" SERIAL NOT NULL,
    "editionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "arabicName" TEXT,
    "style" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Reciter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_slug_key" ON "PaymentMethod"("slug");

-- CreateIndex
CREATE INDEX "TajweedWordSegment_surahNumber_ayahNumber_idx" ON "TajweedWordSegment"("surahNumber", "ayahNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TajweedWordSegment_surahNumber_ayahNumber_wordOrder_key" ON "TajweedWordSegment"("surahNumber", "ayahNumber", "wordOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Reciter_editionId_key" ON "Reciter"("editionId");

-- AddForeignKey
ALTER TABLE "TajweedWordSegment" ADD CONSTRAINT "TajweedWordSegment_ruleCode_fkey" FOREIGN KEY ("ruleCode") REFERENCES "TajweedRule"("code") ON DELETE SET NULL ON UPDATE CASCADE;
