export type TajweedRule =
  | 'IKHFA'
  | 'GHUNNA'
  | 'MUDD'
  | 'QALQALA'
  | 'IDGHAM'
  | 'IZHAAR'
  | 'NONE';

export interface TajweedRuleInfo {
  id: TajweedRule;
  label: string;
  color: string;
}

export const TAJWEED_RULES: TajweedRuleInfo[] = [
  { id: 'IKHFA', label: 'Ikhfa', color: '#22c55e' },
  { id: 'GHUNNA', label: 'Ghunna', color: '#3b82f6' },
  { id: 'MUDD', label: 'Mudd', color: '#ec4899' },
  { id: 'QALQALA', label: 'Qalqala', color: '#f97316' },
  { id: 'IDGHAM', label: 'Idgham', color: '#a855f7' },
  { id: 'IZHAAR', label: 'Izhaar', color: '#eab308' },
];

export interface TajweedWord {
  text: string;
  rule: TajweedRule;
}

export interface VerseTajweedData {
  surahNumber: number;
  ayahNumber: number;
  words: TajweedWord[];
}

/** Demo tajweed segments for Al-Fatiha (screens 2–3). */
const AL_FATIHA_TAJWEED: VerseTajweedData[] = [
  {
    surahNumber: 1,
    ayahNumber: 1,
    words: [
      { text: 'بِسْمِ', rule: 'NONE' },
      { text: 'اللَّهِ', rule: 'GHUNNA' },
      { text: 'الرَّحْمَنِ', rule: 'MUDD' },
      { text: 'الرَّحِيمِ', rule: 'MUDD' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 2,
    words: [
      { text: 'الْحَمْدُ', rule: 'QALQALA' },
      { text: 'لِلَّهِ', rule: 'GHUNNA' },
      { text: 'رَبِّ', rule: 'NONE' },
      { text: 'الْعَالَمِينَ', rule: 'IKHFA' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 3,
    words: [
      { text: 'الرَّحْمَنِ', rule: 'MUDD' },
      { text: 'الرَّحِيمِ', rule: 'MUDD' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 4,
    words: [
      { text: 'مَالِكِ', rule: 'IKHFA' },
      { text: 'يَوْمِ', rule: 'NONE' },
      { text: 'الدِّينِ', rule: 'IDGHAM' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 5,
    words: [
      { text: 'إِيَّاكَ', rule: 'IZHAAR' },
      { text: 'نَعْبُدُ', rule: 'QALQALA' },
      { text: 'وَإِيَّاكَ', rule: 'IZHAAR' },
      { text: 'نَسْتَعِينُ', rule: 'IKHFA' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 6,
    words: [
      { text: 'اهْدِنَا', rule: 'NONE' },
      { text: 'الصِّرَاطَ', rule: 'IKHFA' },
      { text: 'الْمُسْتَقِيمَ', rule: 'MUDD' },
    ],
  },
  {
    surahNumber: 1,
    ayahNumber: 7,
    words: [
      { text: 'صِرَاطَ', rule: 'IKHFA' },
      { text: 'الَّذِينَ', rule: 'GHUNNA' },
      { text: 'أَنْعَمْتَ', rule: 'QALQALA' },
      { text: 'عَلَيْهِمْ', rule: 'IDGHAM' },
    ],
  },
];

const tajweedMap = new Map<string, TajweedWord[]>();
for (const v of AL_FATIHA_TAJWEED) {
  tajweedMap.set(`${v.surahNumber}:${v.ayahNumber}`, v.words);
}

export function getTajweedWords(
  surahNumber: number,
  ayahNumber: number,
): TajweedWord[] | null {
  return tajweedMap.get(`${surahNumber}:${ayahNumber}`) ?? null;
}

export const RECITATION_MODES = {
  WITH_TAJWEED: {
    id: 'WITH_TAJWEED',
    label: 'With Tajweed',
    description: 'Color-coded tajweed rules while you recite.',
  },
  WITHOUT_TAJWEED: {
    id: 'WITHOUT_TAJWEED',
    label: 'Without Tajweed',
    description: 'Plain recitation—no color-coded rules.',
  },
} as const;
