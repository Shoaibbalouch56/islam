export const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1';

export const ARABIC_EDITION = 'quran-uthmani';
export const DEFAULT_TRANSLATION = 'en.sahih';
export const DEFAULT_RECITER = 'ar.alafasy';

export interface TranslationOption {
  id: string;
  name: string;
  language: string;
}

export const TRANSLATIONS: TranslationOption[] = [
  { id: 'en.sahih', name: 'Saheeh International', language: 'English' },
  { id: 'en.pickthall', name: 'Pickthall', language: 'English' },
  { id: 'ur.jalandhry', name: 'Jalandhry', language: 'Urdu' },
  { id: 'ur.junagarhi', name: 'Junagarhi', language: 'Urdu' },
];

export interface FeaturedReciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  avatar: string | null;
}

export const FEATURED_RECITERS: FeaturedReciter[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal',
    avatar: null,
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'Abdul Basit',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    avatar: null,
  },
  {
    id: 'ar.saoodshuraym',
    name: 'Saud Al-Shuraim',
    arabicName: 'سعود الشريم',
    style: 'Murattal',
    avatar: null,
  },
  {
    id: 'ar.hudhaify',
    name: 'Ali Al-Hudhaify',
    arabicName: 'علي الحذيفي',
    style: 'Murattal',
    avatar: null,
  },
  {
    id: 'ar.muhammadayyoub',
    name: 'Muhammad Ayyoub',
    arabicName: 'محمد أيوب',
    style: 'Murattal',
    avatar: null,
  },
];
