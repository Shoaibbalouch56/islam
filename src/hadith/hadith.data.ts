export interface HadithCollectionMeta {
  id: string;
  name: string;
  arabicName: string;
  total: number;
}

export interface HadithTopic {
  id: string;
  name: string;
}

export interface HadithItem {
  id: string;
  collectionId: string;
  collectionName: string;
  hadithNumber: string;
  topic: string;
  narrator: string;
  arabic: string;
  english: string;
  reference: string;
}

export const HADITH_COLLECTIONS: HadithCollectionMeta[] = [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    total: 7563,
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    total: 7500,
  },
];

export const HADITH_TOPICS: HadithTopic[] = [
  { id: 'all', name: 'All' },
  { id: 'prayer', name: 'Prayer' },
  { id: 'fasting', name: 'Fasting' },
  { id: 'charity', name: 'Charity' },
  { id: 'pilgrimage', name: 'Pilgrimage' },
  { id: 'marriage', name: 'Marriage' },
  { id: 'manners', name: 'Manners' },
  { id: 'knowledge', name: 'Knowledge' },
];

export const HADITHS: HadithItem[] = [
  {
    id: 'bukhari-1',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '1',
    topic: 'manners',
    narrator: 'Umar ibn al-Khattab',
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english:
      'Actions are judged by intentions, and every person will get what they intended.',
    reference: 'Sahih al-Bukhari 1',
  },
  {
    id: 'bukhari-8',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '8',
    topic: 'prayer',
    narrator: 'Ibn Umar',
    arabic:
      'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ وَالْحَجِّ وَصَوْمِ رَمَضَانَ',
    english:
      'Islam is built upon five: the testimony that there is no god but Allah, establishing prayer, giving zakat, the pilgrimage, and fasting Ramadan.',
    reference: 'Sahih al-Bukhari 8',
  },
  {
    id: 'bukhari-13',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '13',
    topic: 'manners',
    narrator: 'Anas ibn Malik',
    arabic:
      'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english:
      'None of you truly believes until he loves for his brother what he loves for himself.',
    reference: 'Sahih al-Bukhari 13',
  },
  {
    id: 'bukhari-527',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '527',
    topic: 'prayer',
    narrator: 'Abdullah ibn Masud',
    arabic:
      'سَأَلْتُ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَيُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ قَالَ الصَّلَاةُ عَلَى وَقْتِهَا',
    english:
      'I asked the Prophet which deed is most beloved to Allah. He said: Prayer at its proper time.',
    reference: 'Sahih al-Bukhari 527',
  },
  {
    id: 'bukhari-1397',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '1397',
    topic: 'charity',
    narrator: 'Abu Hurayrah',
    arabic:
      'تَعْبُدُ اللَّهَ وَلَا تُشْرِكُ بِهِ شَيْئًا وَتُقِيمُ الصَّلَاةَ وَتُؤْتِي الزَّكَاةَ الْمَفْرُوضَةَ',
    english:
      'Worship Allah and associate none with Him, establish prayer, and pay the obligatory charity (zakat).',
    reference: 'Sahih al-Bukhari 1397',
  },
  {
    id: 'bukhari-1904',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '1904',
    topic: 'fasting',
    narrator: 'Abu Hurayrah',
    arabic:
      'مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ',
    english:
      'Whoever does not give up false speech and acting upon it, Allah has no need of his giving up his food and drink.',
    reference: 'Sahih al-Bukhari 1904',
  },
  {
    id: 'bukhari-1521',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '1521',
    topic: 'pilgrimage',
    narrator: 'Abu Hurayrah',
    arabic:
      'مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ',
    english:
      'Whoever performs Hajj for Allah and does not commit obscenity or sin returns as free from sin as the day his mother bore him.',
    reference: 'Sahih al-Bukhari 1521',
  },
  {
    id: 'bukhari-5063',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '5063',
    topic: 'marriage',
    narrator: 'Anas ibn Malik',
    arabic:
      'فَمَنْ رَغِبَ عَنْ سُنَّتِي فَلَيْسَ مِنِّي',
    english:
      'Marriage is part of my sunnah, and whoever turns away from my sunnah is not of me.',
    reference: 'Sahih al-Bukhari 5063',
  },
  {
    id: 'bukhari-5185',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '5185',
    topic: 'marriage',
    narrator: 'Abu Hurayrah',
    arabic:
      'اسْتَوْصُوا بِالنِّسَاءِ خَيْرًا',
    english: 'Treat women well and be kind to them.',
    reference: 'Sahih al-Bukhari 5185',
  },
  {
    id: 'bukhari-6018',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '6018',
    topic: 'manners',
    narrator: 'Abu Hurayrah',
    arabic:
      'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    english:
      'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    reference: 'Sahih al-Bukhari 6018',
  },
  {
    id: 'bukhari-6114',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '6114',
    topic: 'manners',
    narrator: 'Abu Hurayrah',
    arabic:
      'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    english:
      'The strong person is not the one who overcomes people by strength, but the one who controls himself when angry.',
    reference: 'Sahih al-Bukhari 6114',
  },
  {
    id: 'bukhari-71',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '71',
    topic: 'knowledge',
    narrator: 'Muawiyah',
    arabic:
      'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
    english:
      'When Allah wishes good for someone, He gives him understanding of the religion.',
    reference: 'Sahih al-Bukhari 71',
  },
  {
    id: 'bukhari-5027',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '5027',
    topic: 'knowledge',
    narrator: 'Uthman ibn Affan',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    english: 'The best among you are those who learn the Quran and teach it.',
    reference: 'Sahih al-Bukhari 5027',
  },
  {
    id: 'bukhari-2989',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '2989',
    topic: 'charity',
    narrator: 'Abu Hurayrah',
    arabic: 'كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ',
    english:
      'Every joint of a person must perform a charity each day; a good word is charity.',
    reference: 'Sahih al-Bukhari 2989',
  },
  {
    id: 'bukhari-1410',
    collectionId: 'bukhari',
    collectionName: 'Sahih al-Bukhari',
    hadithNumber: '1410',
    topic: 'charity',
    narrator: 'Abu Hurayrah',
    arabic:
      'مَنْ تَصَدَّقَ بِعَدْلِ تَمْرَةٍ مِنْ كَسْبٍ طَيِّبٍ',
    english:
      'Whoever gives in charity the equivalent of a date from good earnings, Allah accepts it and makes it grow.',
    reference: 'Sahih al-Bukhari 1410',
  },
  {
    id: 'muslim-8',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '8',
    topic: 'knowledge',
    narrator: 'Umar ibn al-Khattab',
    arabic:
      'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ',
    english:
      'Ihsan is to worship Allah as though you see Him, and if you do not see Him, He surely sees you.',
    reference: 'Sahih Muslim 8',
  },
  {
    id: 'muslim-2564',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '2564',
    topic: 'manners',
    narrator: 'Abu Hurayrah',
    arabic:
      'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    english:
      'Allah does not look at your appearance or wealth, but rather at your hearts and deeds.',
    reference: 'Sahih Muslim 2564',
  },
  {
    id: 'muslim-1631',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '1631',
    topic: 'charity',
    narrator: 'Abu Hurayrah',
    arabic:
      'إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ',
    english:
      'When a person dies, his deeds end except three: ongoing charity, beneficial knowledge, or a righteous child who prays for him.',
    reference: 'Sahih Muslim 1631',
  },
  {
    id: 'muslim-233',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '233',
    topic: 'prayer',
    narrator: 'Abu Hurayrah',
    arabic:
      'الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَةٌ لِمَا بَيْنَهُنَّ',
    english:
      'The five daily prayers and Friday to Friday are an expiation for the sins committed between them.',
    reference: 'Sahih Muslim 233',
  },
  {
    id: 'muslim-1151',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '1151',
    topic: 'fasting',
    narrator: 'Abu Hurayrah',
    arabic:
      'كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ',
    english:
      'Every deed of the son of Adam is for him except fasting; it is for Me and I shall reward it.',
    reference: 'Sahih Muslim 1151',
  },
  {
    id: 'muslim-1337',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '1337',
    topic: 'pilgrimage',
    narrator: 'Abu Hurayrah',
    arabic:
      'أَيُّهَا النَّاسُ قَدْ فَرَضَ اللَّهُ عَلَيْكُمُ الْحَجَّ فَحُجُّوا',
    english:
      'O people, Allah has made Hajj obligatory upon you, so perform Hajj.',
    reference: 'Sahih Muslim 1337',
  },
  {
    id: 'muslim-1467',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '1467',
    topic: 'marriage',
    narrator: 'Abdullah ibn Amr',
    arabic: 'الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ',
    english:
      'The world is provision, and the best provision of the world is a righteous wife.',
    reference: 'Sahih Muslim 1467',
  },
  {
    id: 'muslim-2699',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '2699',
    topic: 'knowledge',
    narrator: 'Abu Hurayrah',
    arabic:
      'وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    english:
      'Whoever travels a path seeking knowledge, Allah makes easy for him a path to Paradise.',
    reference: 'Sahih Muslim 2699',
  },
  {
    id: 'muslim-2626',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '2626',
    topic: 'manners',
    narrator: 'Jarir ibn Abdullah',
    arabic: 'مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ',
    english: 'Whoever does not show mercy to people, Allah will not show mercy to him.',
    reference: 'Sahih Muslim 2626',
  },
  {
    id: 'muslim-2588',
    collectionId: 'muslim',
    collectionName: 'Sahih Muslim',
    hadithNumber: '2588',
    topic: 'charity',
    narrator: 'Abu Hurayrah',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    english: 'Charity does not decrease wealth.',
    reference: 'Sahih Muslim 2588',
  },
];

export function getDailyHadith(date = new Date()): HadithItem {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return HADITHS[dayOfYear % HADITHS.length];
}
