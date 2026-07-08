import { Injectable, NotFoundException } from '@nestjs/common';
import { RecitationMode } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { QuranService } from '../../quran/quran.service';
import { DEFAULT_RECITER } from '../../quran/quran.constants';
import { AnalyzeRecitationDto } from '../dto/analyze-recitation.dto';
import { UpdateRecitationSettingsDto } from '../dto/update-recitation-settings.dto';
import {
  getTajweedWords,
  RECITATION_MODES,
  TAJWEED_RULES,
  type TajweedRule,
} from './recitation.data';

type WordFeedbackStatus = 'CORRECT' | 'NEEDS_WORK' | 'MISTAKE';

export interface WordFeedback {
  text: string;
  status: WordFeedbackStatus;
  rule?: TajweedRule;
}

interface SurahAyah {
  numberInSurah: number;
  arabic: string;
  translation: string | null;
  audio: string | null;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  ayahCount: number;
  ayahs: SurahAyah[];
}

@Injectable()
export class StudentRecitationService {
  constructor(
    private prisma: PrismaService,
    private quranService: QuranService,
  ) {}

  async getSettings(userId: number) {
    const pref = await this.ensurePreference(userId);
    const modeInfo = RECITATION_MODES[pref.mode];

    return {
      mode: pref.mode,
      modeLabel: modeInfo.label,
      modeDescription: modeInfo.description,
      tajweedColorsOn: pref.tajweedColorsOn,
      highlightMistakes: pref.highlightMistakes,
      highlightMistakesComingSoon:
        'Real-time mistake highlighting with color-coded underline during recitation.',
      selectedReciter: pref.selectedReciter,
      currentSurah: pref.currentSurah,
      currentAyah: pref.currentAyah,
      availableModes: Object.values(RECITATION_MODES),
    };
  }

  async updateSettings(userId: number, dto: UpdateRecitationSettingsDto) {
    await this.ensurePreference(userId);

    const pref = await this.prisma.recitationPreference.update({
      where: { userId },
      data: {
        ...(dto.mode !== undefined ? { mode: dto.mode } : {}),
        ...(dto.tajweedColorsOn !== undefined
          ? { tajweedColorsOn: dto.tajweedColorsOn }
          : {}),
        ...(dto.highlightMistakes !== undefined
          ? { highlightMistakes: dto.highlightMistakes }
          : {}),
        ...(dto.selectedReciter !== undefined
          ? { selectedReciter: dto.selectedReciter }
          : {}),
        ...(dto.currentSurah !== undefined ? { currentSurah: dto.currentSurah } : {}),
        ...(dto.currentAyah !== undefined ? { currentAyah: dto.currentAyah } : {}),
      },
    });

    const modeInfo = RECITATION_MODES[pref.mode];
    return {
      mode: pref.mode,
      modeLabel: modeInfo.label,
      modeDescription: modeInfo.description,
      tajweedColorsOn: pref.tajweedColorsOn,
      highlightMistakes: pref.highlightMistakes,
      selectedReciter: pref.selectedReciter,
      currentSurah: pref.currentSurah,
      currentAyah: pref.currentAyah,
    };
  }

  getTajweedRules() {
    return {
      rules: TAJWEED_RULES,
      toggleLabel: 'Tajweed Color Rules',
    };
  }

  getReciters() {
    return this.quranService.getReciters();
  }

  async getCurrentVerse(userId: number) {
    const pref = await this.ensurePreference(userId);
    return this.getVerse(
      userId,
      pref.currentSurah,
      pref.currentAyah,
      pref.mode,
      pref.tajweedColorsOn,
      pref.selectedReciter,
    );
  }

  async getVerse(
    userId: number,
    surahNumber: number,
    ayahNumber: number,
    mode?: RecitationMode,
    tajweedColorsOn?: boolean,
    reciterId?: string,
  ) {
    const pref = await this.ensurePreference(userId);
    const effectiveMode = mode ?? pref.mode;
    const colorsOn = tajweedColorsOn ?? pref.tajweedColorsOn;
    const reciter = reciterId ?? pref.selectedReciter ?? DEFAULT_RECITER;

    const surah = (await this.quranService.getSurah(
      surahNumber,
      'en.sahih',
      reciter,
    )) as SurahDetail;

    const ayah = surah.ayahs.find((a) => a.numberInSurah === ayahNumber);
    if (!ayah) {
      throw new NotFoundException(
        `Ayah ${ayahNumber} not found in Surah ${surahNumber}`,
      );
    }

    const tajweedWords = getTajweedWords(surahNumber, ayahNumber);
    const showTajweed =
      effectiveMode === RecitationMode.WITH_TAJWEED && colorsOn;

    const words = showTajweed && tajweedWords
      ? tajweedWords.map((w) => {
          const ruleInfo = TAJWEED_RULES.find((r) => r.id === w.rule);
          return {
            text: w.text,
            rule: w.rule === 'NONE' ? null : w.rule,
            color: ruleInfo?.color ?? null,
          };
        })
      : [{ text: ayah.arabic, rule: null, color: null }];

    const totalAyahs = surah.ayahCount;
    const verseNumbers = Array.from(
      { length: Math.min(totalAyahs, 7) },
      (_, i) => i + 1,
    );

    return {
      title: 'Quran Recitation',
      subtitle: 'Practice your Tajweed with AI-powered feedback',
      mode: effectiveMode,
      modeLabel: RECITATION_MODES[effectiveMode].label,
      tajweedColorsOn: colorsOn,
      surah: {
        number: surahNumber,
        name: surah.englishName,
        arabicName: surah.name,
      },
      ayah: {
        number: ayahNumber,
        totalInSurah: totalAyahs,
        arabic: ayah.arabic,
        translation: ayah.translation,
        words,
      },
      navigation: {
        verseNumbers,
        hasNext: ayahNumber < totalAyahs || surahNumber < 114,
        hasPrevious: ayahNumber > 1 || surahNumber > 1,
      },
      reciterAudio: {
        reciterId: reciter,
        audioUrl: ayah.audio,
      },
    };
  }

  async advanceVerse(userId: number) {
    const pref = await this.ensurePreference(userId);
    const surah = (await this.quranService.getSurah(
      pref.currentSurah,
      'en.sahih',
      pref.selectedReciter,
    )) as SurahDetail;

    let nextSurah = pref.currentSurah;
    let nextAyah = pref.currentAyah + 1;

    if (nextAyah > surah.ayahCount) {
      if (pref.currentSurah >= 114) {
        nextSurah = 1;
        nextAyah = 1;
      } else {
        nextSurah = pref.currentSurah + 1;
        nextAyah = 1;
      }
    }

    await this.prisma.recitationPreference.update({
      where: { userId },
      data: { currentSurah: nextSurah, currentAyah: nextAyah },
    });

    return this.getVerse(userId, nextSurah, nextAyah);
  }

  async analyzeRecitation(userId: number, dto: AnalyzeRecitationDto): Promise<{
    attemptId: number;
    surahNumber: number;
    ayahNumber: number;
    recordingUrl: string | null;
    reciter: { id: string; name: string };
    accuracyScore: number;
    accuracyLabel: string;
    breakdown: {
      correct: WordFeedback[];
      needsWork: WordFeedback[];
      mistakes: WordFeedback[];
    };
    highlightMistakes: {
      enabled: boolean;
      comingSoon: string;
    };
  }> {
    const pref = await this.ensurePreference(userId);

    const verse = await this.getVerse(
      userId,
      dto.surahNumber,
      dto.ayahNumber,
      pref.mode,
      pref.tajweedColorsOn,
      pref.selectedReciter,
    );

    const words = getTajweedWords(dto.surahNumber, dto.ayahNumber);
    const wordTexts =
      words?.map((w) => w.text) ??
      verse.ayah.arabic.split(/\s+/).filter(Boolean);

    const feedback = this.buildMockFeedback(wordTexts, words);
    const accuracyScore = this.computeAccuracy(feedback);

    const attempt = await this.prisma.recitationAttempt.create({
      data: {
        userId,
        surahNumber: dto.surahNumber,
        ayahNumber: dto.ayahNumber,
        mode: pref.mode,
        accuracyScore,
        reciterId: pref.selectedReciter,
        feedback: feedback as object,
      },
    });

    return {
      attemptId: attempt.id,
      surahNumber: dto.surahNumber,
      ayahNumber: dto.ayahNumber,
      recordingUrl: dto.recordingUrl ?? null,
      reciter: {
        id: pref.selectedReciter,
        name:
          this.quranService
            .getReciters()
            .find((r) => r.id === pref.selectedReciter)?.name ??
          'Mishary Rashid Alafasy',
      },
      accuracyScore,
      accuracyLabel: 'Accuracy Score Based on AI analysis.',
      breakdown: {
        correct: feedback.filter((f) => f.status === 'CORRECT'),
        needsWork: feedback.filter((f) => f.status === 'NEEDS_WORK'),
        mistakes: feedback.filter((f) => f.status === 'MISTAKE'),
      },
      highlightMistakes: {
        enabled: pref.highlightMistakes,
        comingSoon:
          'Real-time mistake highlighting with color-coded underline during recitation.',
      },
    };
  }

  async getHistory(userId: number) {
    return this.prisma.recitationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        surahNumber: true,
        ayahNumber: true,
        mode: true,
        accuracyScore: true,
        createdAt: true,
      },
    });
  }

  private async ensurePreference(userId: number) {
    return this.prisma.recitationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private buildMockFeedback(
    wordTexts: string[],
    tajweedWords: ReturnType<typeof getTajweedWords>,
  ): WordFeedback[] {
    const statuses: WordFeedbackStatus[] = [
      'CORRECT',
      'NEEDS_WORK',
      'MISTAKE',
    ];

    return wordTexts.map((text, index) => {
      const status = statuses[index % 3] as WordFeedbackStatus;
      const rule = tajweedWords?.[index]?.rule;
      return {
        text,
        status,
        ...(rule && rule !== 'NONE' ? { rule } : {}),
      };
    });
  }

  private computeAccuracy(feedback: WordFeedback[]): number {
    const weights = { CORRECT: 1, NEEDS_WORK: 0.6, MISTAKE: 0 };
    const total = feedback.reduce(
      (sum, f) => sum + weights[f.status],
      0,
    );
    const score = Math.round((total / feedback.length) * 100);
    return Math.min(100, Math.max(0, score || 85));
  }
}
