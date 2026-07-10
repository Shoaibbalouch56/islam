import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FeedbackDemoStatus, RecitationMode } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PortalContentService } from '../../portal-content/portal-content.service';
import { QuranService } from '../../quran/quran.service';
import { AnalyzeRecitationDto } from '../dto/analyze-recitation.dto';
import { UpdateRecitationSettingsDto } from '../dto/update-recitation-settings.dto';

type WordFeedbackStatus = 'CORRECT' | 'NEEDS_WORK' | 'MISTAKE';

export interface WordFeedback {
  text: string;
  status: WordFeedbackStatus;
  rule?: string;
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
    private portalContent: PortalContentService,
  ) {}

  async getSettings(userId: number) {
    const pref = await this.ensurePreference(userId);
    const [modeInfo, availableModes, comingSoon] = await Promise.all([
      this.portalContent.getRecitationMode(pref.mode),
      this.portalContent.getRecitationModes(),
      this.portalContent.getSetting(
        'student.recitation.highlight_coming_soon',
        'Real-time mistake highlighting with color-coded underline during recitation.',
      ),
    ]);

    return {
      mode: pref.mode,
      modeLabel: modeInfo?.label ?? pref.mode,
      modeDescription: modeInfo?.description ?? '',
      tajweedColorsOn: pref.tajweedColorsOn,
      highlightMistakes: pref.highlightMistakes,
      highlightMistakesComingSoon: comingSoon,
      selectedReciter: pref.selectedReciter,
      currentSurah: pref.currentSurah,
      currentAyah: pref.currentAyah,
      availableModes,
    };
  }

  async updateSettings(userId: number, dto: UpdateRecitationSettingsDto) {
    await this.ensurePreference(userId);

    if (dto.selectedReciter) {
      const reciter = await this.portalContent.validateReciterEditionId(
        dto.selectedReciter,
      );
      if (!reciter) {
        throw new BadRequestException('Invalid reciter');
      }
    }

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

    const modeInfo = await this.portalContent.getRecitationMode(pref.mode);
    return {
      mode: pref.mode,
      modeLabel: modeInfo?.label ?? pref.mode,
      modeDescription: modeInfo?.description ?? '',
      tajweedColorsOn: pref.tajweedColorsOn,
      highlightMistakes: pref.highlightMistakes,
      selectedReciter: pref.selectedReciter,
      currentSurah: pref.currentSurah,
      currentAyah: pref.currentAyah,
    };
  }

  async getTajweedRules() {
    const [rules, toggleLabel] = await Promise.all([
      this.portalContent.getTajweedRules(),
      this.portalContent.getSetting(
        'student.tajweed.toggle_label',
        'Tajweed Color Rules',
      ),
    ]);

    return {
      rules: rules.map((r) => ({
        id: r.code,
        label: r.label,
        color: r.color,
      })),
      toggleLabel,
    };
  }

  async getReciters() {
    const reciters = await this.portalContent.getReciters();
    return reciters.map((r) => ({
      id: r.editionId,
      name: r.name,
      arabicName: r.arabicName,
      style: r.style,
      avatar: r.avatar,
    }));
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
    const reciter =
      reciterId ??
      pref.selectedReciter ??
      (await this.portalContent.getDefaultReciterEditionId());

    const [surah, modeInfo, segments, copy] = await Promise.all([
      this.quranService.getSurah(surahNumber, 'en.sahih', reciter) as Promise<SurahDetail>,
      this.portalContent.getRecitationMode(effectiveMode),
      this.portalContent.getTajweedSegments(surahNumber, ayahNumber),
      this.portalContent.getSettings([
        'student.recitation.title',
        'student.recitation.subtitle',
      ]),
    ]);

    const ayah = surah.ayahs.find((a) => a.numberInSurah === ayahNumber);
    if (!ayah) {
      throw new NotFoundException(
        `Ayah ${ayahNumber} not found in Surah ${surahNumber}`,
      );
    }

    const showTajweed =
      effectiveMode === 'WITH_TAJWEED' && colorsOn && segments.length > 0;

    const words = showTajweed
      ? segments.map((w) => ({
          text: w.text,
          rule: w.ruleCode,
          color: w.rule?.color ?? null,
        }))
      : [{ text: ayah.arabic, rule: null, color: null }];

    const totalAyahs = surah.ayahCount;
    const verseNumbers = Array.from(
      { length: Math.min(totalAyahs, 7) },
      (_, i) => i + 1,
    );

    return {
      title: copy('student.recitation.title', 'Quran Recitation'),
      subtitle: copy(
        'student.recitation.subtitle',
        'Practice your Tajweed with AI-powered feedback',
      ),
      mode: effectiveMode,
      modeLabel: modeInfo?.label ?? effectiveMode,
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

    const [verse, segments, reciters, accuracyLabel, comingSoon] =
      await Promise.all([
        this.getVerse(
          userId,
          dto.surahNumber,
          dto.ayahNumber,
          pref.mode,
          pref.tajweedColorsOn,
          pref.selectedReciter,
        ),
        this.portalContent.getTajweedSegments(dto.surahNumber, dto.ayahNumber),
        this.portalContent.getReciters(),
        this.portalContent.getSetting(
          'student.recitation.accuracy_label',
          'Accuracy Score Based on AI analysis.',
        ),
        this.portalContent.getSetting(
          'student.recitation.highlight_coming_soon',
          'Real-time mistake highlighting with color-coded underline during recitation.',
        ),
      ]);

    const wordTexts =
      segments.length > 0
        ? segments.map((w) => w.text)
        : verse.ayah.arabic.split(/\s+/).filter(Boolean);

    const feedback = this.buildFeedbackFromDb(wordTexts, segments);
    const accuracyScore = this.computeAccuracy(feedback);

    const attempt = await this.prisma.recitationAttempt.create({
      data: {
        userId,
        surahNumber: dto.surahNumber,
        ayahNumber: dto.ayahNumber,
        mode: pref.mode,
        accuracyScore,
        reciterId: pref.selectedReciter,
        recordingUrl: dto.recordingUrl ?? null,
        feedback: feedback as object,
      },
    });

    const reciter = reciters.find((r) => r.editionId === pref.selectedReciter);

    return {
      attemptId: attempt.id,
      surahNumber: dto.surahNumber,
      ayahNumber: dto.ayahNumber,
      recordingUrl: dto.recordingUrl ?? null,
      reciter: {
        id: pref.selectedReciter,
        name: reciter?.name ?? 'Reciter',
      },
      accuracyScore,
      accuracyLabel,
      breakdown: {
        correct: feedback.filter((f) => f.status === 'CORRECT'),
        needsWork: feedback.filter((f) => f.status === 'NEEDS_WORK'),
        mistakes: feedback.filter((f) => f.status === 'MISTAKE'),
      },
      highlightMistakes: {
        enabled: pref.highlightMistakes,
        comingSoon,
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
        recordingUrl: true,
        createdAt: true,
      },
    });
  }

  /** Screen 2 & 4 — Quran Recitation practice (With / Without Tajweed) */
  async getPracticeScreen(userId: number) {
    const [settings, tajweedRules, verse] = await Promise.all([
      this.getSettings(userId),
      this.getTajweedRules(),
      this.getCurrentVerse(userId),
    ]);

    const copy = await this.portalContent.getSettings([
      'student.recitation.modes_label',
      'student.recitation.next_label',
    ]);

    return {
      screen: 'recitation_practice',
      header: {
        title: verse.title,
        subtitle: verse.subtitle,
      },
      modes: {
        label: copy('student.recitation.modes_label', 'Modes'),
        selected: settings.mode,
        selectedLabel: settings.modeLabel,
        selectedDescription: settings.modeDescription,
        options: settings.availableModes,
        tajweedColorsOn: settings.tajweedColorsOn,
      },
      tajweedColorRules: {
        visible: settings.mode === 'WITH_TAJWEED',
        enabled: settings.tajweedColorsOn,
        toggleLabel: tajweedRules.toggleLabel,
        rules: tajweedRules.rules,
      },
      content: {
        surah: verse.surah,
        ayah: verse.ayah,
        navigation: verse.navigation,
      },
      reciterAudio: verse.reciterAudio,
      primaryAction: {
        label: copy('student.recitation.next_label', 'Next >'),
        hasNext: verse.navigation.hasNext,
      },
    };
  }

  /** Screen 3 & 5 — AI pronunciation feedback + audio comparison */
  async getFeedbackScreen(userId: number) {
    const pref = await this.ensurePreference(userId);
    const [settings, verse, reciters, copy] = await Promise.all([
      this.getSettings(userId),
      this.getCurrentVerse(userId),
      this.portalContent.getReciters(),
      this.portalContent.getSettings([
        'student.recitation.audio_comparison_label',
        'student.recitation.reciter_label',
        'student.recitation.your_recording_label',
        'student.recitation.recording_prompt',
        'student.recitation.ai_feedback_label',
        'student.recitation.ai_feedback_badge',
        'student.recitation.mic_prompt',
        'student.recitation.highlight_mistakes_label',
        'student.recitation.highlight_coming_soon',
        'student.recitation.accuracy_label',
      ]),
    ]);

    const reciter = reciters.find((r) => r.editionId === pref.selectedReciter);
    const lastAttempt = await this.prisma.recitationAttempt.findFirst({
      where: {
        userId,
        surahNumber: pref.currentSurah,
        ayahNumber: pref.currentAyah,
      },
      orderBy: { createdAt: 'desc' },
    });

    const feedback = lastAttempt?.feedback as WordFeedback[] | null;
    const breakdown = feedback
      ? {
          correct: feedback.filter((f) => f.status === 'CORRECT'),
          needsWork: feedback.filter((f) => f.status === 'NEEDS_WORK'),
          mistakes: feedback.filter((f) => f.status === 'MISTAKE'),
        }
      : null;

    return {
      screen: 'recitation_feedback',
      header: {
        title: verse.title,
        subtitle: verse.subtitle,
      },
      modes: {
        selected: settings.mode,
        selectedLabel: settings.modeLabel,
        options: settings.availableModes,
      },
      audioComparison: {
        label: copy(
          'student.recitation.audio_comparison_label',
          'Audio Comparison',
        ),
        reciter: {
          label: copy('student.recitation.reciter_label', 'Reciter'),
          id: pref.selectedReciter,
          name: reciter?.name ?? 'Reciter',
          audioUrl: verse.reciterAudio.audioUrl,
        },
        yourRecording: {
          label: copy(
            'student.recitation.your_recording_label',
            'Your Recording',
          ),
          status: lastAttempt?.recordingUrl ? 'recorded' : 'empty',
          audioUrl: lastAttempt?.recordingUrl ?? null,
          prompt: copy(
            'student.recitation.recording_prompt',
            'Tap mic below to record',
          ),
        },
      },
      aiPronunciationFeedback: {
        label: copy(
          'student.recitation.ai_feedback_label',
          'AI Pronunciation Feedback',
        ),
        badge: copy('student.recitation.ai_feedback_badge', 'AI-powered'),
        accuracyLabel: copy(
          'student.recitation.accuracy_label',
          'Accuracy Score Based on AI analysis.',
        ),
        analysis: lastAttempt
          ? {
              attemptId: lastAttempt.id,
              accuracyScore: lastAttempt.accuracyScore,
              breakdown,
              createdAt: lastAttempt.createdAt,
            }
          : null,
        emptyPrompt: copy(
          'student.recitation.mic_prompt',
          'Tap to start reciting',
        ),
      },
      highlightMistakes: {
        label: copy(
          'student.recitation.highlight_mistakes_label',
          'Highlight Mistakes',
        ),
        enabled: settings.highlightMistakes,
        comingSoon: copy(
          'student.recitation.highlight_coming_soon',
          'Real-time mistake highlighting with color-coded underline during recitation.',
        ),
        featureStatus: 'coming_soon',
      },
      controls: {
        micPrompt: copy(
          'student.recitation.mic_prompt',
          'Tap to start reciting',
        ),
      },
      currentVerse: {
        surahNumber: pref.currentSurah,
        ayahNumber: pref.currentAyah,
        arabic: verse.ayah.arabic,
      },
    };
  }

  private async ensurePreference(userId: number) {
    const existing = await this.prisma.recitationPreference.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const defaultReciter = await this.portalContent.getDefaultReciterEditionId();
    return this.prisma.recitationPreference.create({
      data: { userId, selectedReciter: defaultReciter },
    });
  }

  private buildFeedbackFromDb(
    wordTexts: string[],
    segments: Awaited<ReturnType<PortalContentService['getTajweedSegments']>>,
  ): WordFeedback[] {
    const fallback: WordFeedbackStatus[] = [
      'CORRECT',
      'NEEDS_WORK',
      'MISTAKE',
    ];

    return wordTexts.map((text, index) => {
      const segment = segments[index];
      const status = segment?.demoStatus
        ? this.mapDemoStatus(segment.demoStatus)
        : fallback[index % 3];
      return {
        text,
        status,
        ...(segment?.ruleCode ? { rule: segment.ruleCode } : {}),
      };
    });
  }

  private mapDemoStatus(status: FeedbackDemoStatus): WordFeedbackStatus {
    switch (status) {
      case 'NEEDS_WORK':
        return 'NEEDS_WORK';
      case 'MISTAKE':
        return 'MISTAKE';
      default:
        return 'CORRECT';
    }
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
