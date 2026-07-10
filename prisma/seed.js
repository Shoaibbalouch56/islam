const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const regions = [
  { code: 'US', name: 'United States', flag: '🇺🇸', sortOrder: 1 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', sortOrder: 2 },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', sortOrder: 3 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', sortOrder: 4 },
  { code: 'EU', name: 'Europe', flag: '🇪🇺', sortOrder: 5 },
];

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', isDefault: true, sortOrder: 1 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isDefault: false, sortOrder: 2 },
];

const courses = [
  {
    slug: 'nazra-quran',
    title: 'Nazra Quran',
    description: 'Learn to read the Quran fluently with proper pronunciation.',
    duration: '4 months',
    icon: 'book',
    thumbnail: null,
    isDashboardCategory: true,
    defaultProgressPercent: 65,
    sortOrder: 1,
  },
  {
    slug: 'hifz-program',
    title: 'Hifz Program',
    description: 'Complete memorization of the Holy Quran with certified teachers.',
    duration: null,
    icon: 'scroll',
    thumbnail: null,
    isDashboardCategory: true,
    sortOrder: 2,
  },
  {
    slug: 'tajweed-rules',
    title: 'Tajweed Rules',
    description: 'Master the art of Quran recitation with correct articulation.',
    duration: '3 months',
    icon: 'graduation-cap',
    thumbnail: null,
    isDashboardCategory: true,
    sortOrder: 3,
  },
  {
    slug: 'basic-islamic-studies',
    title: 'Basic Islamic Studies',
    description: 'Core fundamentals of Islamic knowledge and practice.',
    duration: null,
    icon: 'mosque',
    thumbnail: null,
    level: 'Beginner',
    rating: 4.8,
    studentCount: 1200,
    isFeatured: false,
    defaultProgressPercent: 44,
    sortOrder: 4,
  },
  {
    slug: 'quran-recitation',
    title: "Qur'an Recitation for Beginners",
    description: 'Perfect your recitation with guided practice.',
    duration: '3 months',
    icon: 'microphone',
    thumbnail: null,
    level: 'Beginner to Advanced',
    rating: 4.9,
    studentCount: 2400,
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: 'tajweed-course',
    title: 'Tajweed Course',
    description: 'Perfect your recitation with tajweed rules.',
    duration: '2 months',
    icon: 'star',
    thumbnail: null,
    level: 'Beginner to Advanced',
    rating: 4.9,
    studentCount: 1800,
    isFeatured: true,
    sortOrder: 6,
  },
  {
    slug: 'nazra-course',
    title: 'Nazra Course',
    description: 'Learn to read the Quran fluently.',
    duration: '4 months',
    icon: 'book-open',
    thumbnail: null,
    level: 'Beginner',
    rating: 4.7,
    studentCount: 950,
    isFeatured: true,
    sortOrder: 7,
  },
];

const timeslots = [
  { slug: 'fajr-early-morning', label: 'Fajr / Early Morning', startTime: '05:00', endTime: '07:00', sortOrder: 1 },
  { slug: 'morning', label: 'Morning', startTime: '09:00', endTime: '11:00', sortOrder: 2 },
  { slug: 'afternoon', label: 'Afternoon', startTime: '14:00', endTime: '16:00', sortOrder: 3 },
  { slug: 'evening', label: 'Evening', startTime: '18:00', endTime: '20:00', sortOrder: 4 },
  { slug: 'night', label: 'Night', startTime: '21:00', endTime: '23:00', sortOrder: 5 },
];

const plans = [
  {
    category: 'JOINT',
    tier: 'BASIC',
    name: 'Basic',
    price: 29,
    classesPerWeek: 3,
    features: ['3 classes per week', 'Group Sessions', 'Basic Support'],
    isPopular: false,
    sortOrder: 1,
  },
  {
    category: 'JOINT',
    tier: 'STANDARD',
    name: 'Standard',
    price: 49,
    classesPerWeek: 5,
    features: ['5 classes per week', 'Group Sessions', 'Progress Tracking'],
    isPopular: true,
    sortOrder: 2,
  },
  {
    category: 'JOINT',
    tier: 'PREMIUM',
    name: 'Premium',
    price: 79,
    classesPerWeek: 7,
    features: ['Daily Classes (7 days)', '1-on-1 Sessions Available', 'Dedicated Teacher', '24/7 Support'],
    isPopular: false,
    sortOrder: 3,
  },
  {
    category: 'SEPARATE',
    tier: 'BASIC',
    name: 'Basic',
    price: 59,
    classesPerWeek: 3,
    features: ['Fully personalized sessions', 'Flexible timing', 'Dedicated teacher'],
    isPopular: false,
    sortOrder: 1,
  },
  {
    category: 'SEPARATE',
    tier: 'STANDARD',
    name: 'Standard',
    price: 99,
    classesPerWeek: 5,
    features: ['5 personalized sessions/week', 'Flexible timing', 'Dedicated teacher', 'Progress Tracking'],
    isPopular: true,
    sortOrder: 2,
  },
  {
    category: 'SEPARATE',
    tier: 'PREMIUM',
    name: 'Premium',
    price: 149,
    classesPerWeek: 7,
    features: ['Daily 1-on-1 sessions', 'Fully flexible timing', 'Dedicated teacher', '24/7 Support'],
    isPopular: false,
    sortOrder: 3,
  },
];

const addons = [
  {
    slug: 'female-teacher',
    name: 'Female Teacher',
    description: 'Request a qualified female teacher for a more comfortable learning environment.',
    price: 5,
    sortOrder: 1,
  },
  {
    slug: 'weekend-classes',
    name: 'Weekend Classes',
    description: 'Add weekend sessions for extra practice on Saturday and Sunday.',
    price: 10,
    sortOrder: 2,
  },
  {
    slug: 'one-on-one-upgrade',
    name: '1-on-1 Upgrade',
    description: 'Upgrade your group plan to include private one-on-one sessions.',
    price: 15,
    sortOrder: 3,
  },
];

const coupons = [
  { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10 },
  { code: 'SAVE5', discountType: 'FIXED', discountValue: 5 },
];

async function main() {
  for (const r of regions) {
    await prisma.region.upsert({ where: { code: r.code }, update: r, create: r });
  }
  for (const l of languages) {
    await prisma.language.upsert({ where: { code: l.code }, update: l, create: l });
  }
  for (const c of courses) {
    await prisma.course.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  for (const t of timeslots) {
    await prisma.timeSlot.upsert({ where: { slug: t.slug }, update: t, create: t });
  }
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { category_tier: { category: p.category, tier: p.tier } },
      update: p,
      create: p,
    });
  }
  for (const a of addons) {
    await prisma.addon.upsert({ where: { slug: a.slug }, update: a, create: a });
  }
  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: c, create: c });
  }

  await seedStudentPortalContent();
  await seedTeacherPortal();
  console.log('Seed complete: regions, languages, courses, timeslots, plans, addons, coupons, student portal, teacher portal');
}

async function seedStudentPortalContent() {
  const dailyQuotes = [
    { text: 'The best among you are those who learn the Quran and teach it.', source: 'Sahih al-Bukhari 5027', sortOrder: 1 },
    { text: 'The deeds most loved by Allah are those done regularly, even if they are small.', source: 'Sahih al-Bukhari 6464', sortOrder: 2 },
    { text: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'Sahih al-Bukhari 13', sortOrder: 3 },
    { text: 'A good word is charity.', source: 'Sahih al-Bukhari 2989', sortOrder: 4 },
    { text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.', source: 'Sahih al-Bukhari 6018', sortOrder: 5 },
    { text: 'The strong person is not the one who overcomes people by his strength, but the one who controls himself while in anger.', source: 'Sahih al-Bukhari 6114', sortOrder: 6 },
    { text: 'Make things easy and do not make things difficult, give glad tidings and do not repel people.', source: 'Sahih al-Bukhari 69', sortOrder: 7 },
    { text: 'Allah does not look at your appearance or wealth, but rather at your hearts and deeds.', source: 'Sahih Muslim 2564', sortOrder: 8 },
    { text: 'He who does not thank people, does not thank Allah.', source: 'Sunan Abi Dawud 4811', sortOrder: 9 },
    { text: 'The most beloved of people to Allah are those who are most beneficial to people.', source: "Al-Mu'jam al-Awsat 6026", sortOrder: 10 },
  ];

  for (const q of dailyQuotes) {
    const existing = await prisma.dailyQuote.findFirst({ where: { text: q.text } });
    if (!existing) {
      await prisma.dailyQuote.create({ data: q });
    }
  }

  const paymentMethods = [
    { slug: 'stripe', name: 'Stripe', description: 'Credit / debit card', sortOrder: 1 },
    { slug: 'apple_pay', name: 'Apple Pay', description: 'Quick & secure checkout', sortOrder: 2 },
    { slug: 'google_pay', name: 'Google Pay', description: 'Fast and easy payment', sortOrder: 3 },
    { slug: 'paypal', name: 'PayPal', description: 'Pay using your PayPal balance', sortOrder: 4 },
  ];
  for (const m of paymentMethods) {
    await prisma.paymentMethod.upsert({ where: { slug: m.slug }, update: m, create: m });
  }

  const appSettings = [
    { key: 'student.trial_days', value: '7' },
    { key: 'student.dashboard.tagline', value: 'Journey of knowledge and faith' },
    { key: 'student.dashboard.search_placeholder', value: 'Search courses, surahs, topics…' },
    { key: 'student.recitation.title', value: 'Quran Recitation' },
    { key: 'student.recitation.subtitle', value: 'Practice your Tajweed with AI-powered feedback' },
    { key: 'student.recitation.accuracy_label', value: 'Accuracy Score Based on AI analysis.' },
    { key: 'student.recitation.highlight_coming_soon', value: 'Real-time mistake highlighting with color-coded underline during recitation.' },
    { key: 'student.tajweed.toggle_label', value: 'Tajweed Color Rules' },
    { key: 'student.recitation.modes_label', value: 'Modes' },
    { key: 'student.recitation.next_label', value: 'Next >' },
    { key: 'student.recitation.audio_comparison_label', value: 'Audio Comparison' },
    { key: 'student.recitation.reciter_label', value: 'Reciter' },
    { key: 'student.recitation.your_recording_label', value: 'Your Recording' },
    { key: 'student.recitation.recording_prompt', value: 'Tap mic below to record' },
    { key: 'student.recitation.ai_feedback_label', value: 'AI Pronunciation Feedback' },
    { key: 'student.recitation.ai_feedback_badge', value: 'AI-powered' },
    { key: 'student.recitation.mic_prompt', value: 'Tap to start reciting' },
    { key: 'student.recitation.highlight_mistakes_label', value: 'Highlight Mistakes' },
  ];
  for (const s of appSettings) {
    await prisma.appSetting.upsert({ where: { key: s.key }, update: s, create: s });
  }

  const tajweedRules = [
    { code: 'IKHFA', label: 'Ikhfa', color: '#22c55e', sortOrder: 1 },
    { code: 'GHUNNA', label: 'Ghunna', color: '#3b82f6', sortOrder: 2 },
    { code: 'MUDD', label: 'Mudd', color: '#ec4899', sortOrder: 3 },
    { code: 'QALQALA', label: 'Qalqala', color: '#f97316', sortOrder: 4 },
    { code: 'IDGHAM', label: 'Idgham', color: '#a855f7', sortOrder: 5 },
    { code: 'IZHAAR', label: 'Izhaar', color: '#eab308', sortOrder: 6 },
  ];
  for (const r of tajweedRules) {
    await prisma.tajweedRule.upsert({ where: { code: r.code }, update: r, create: r });
  }

  const recitationModes = [
    { mode: 'WITH_TAJWEED', label: 'With Tajweed', description: 'Color-coded tajweed rules while you recite.', sortOrder: 1 },
    { mode: 'WITHOUT_TAJWEED', label: 'Without Tajweed', description: 'Plain recitation—no color-coded rules.', sortOrder: 2 },
  ];
  for (const m of recitationModes) {
    await prisma.recitationModeInfo.upsert({ where: { mode: m.mode }, update: m, create: m });
  }

  const reciters = [
    { editionId: 'ar.alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', style: 'Murattal', sortOrder: 1 },
    { editionId: 'ar.abdulbasitmurattal', name: 'Abdul Basit', arabicName: 'عبد الباسط عبد الصمد', style: 'Murattal', sortOrder: 2 },
    { editionId: 'ar.saoodshuraym', name: 'Saud Al-Shuraim', arabicName: 'سعود الشريم', style: 'Murattal', sortOrder: 3 },
    { editionId: 'ar.hudhaify', name: 'Ali Al-Hudhaify', arabicName: 'علي الحذيفي', style: 'Murattal', sortOrder: 4 },
    { editionId: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', arabicName: 'محمد أيوب', style: 'Murattal', sortOrder: 5 },
  ];
  for (const r of reciters) {
    await prisma.reciter.upsert({ where: { editionId: r.editionId }, update: r, create: r });
  }

  const tajweedSegments = [
    { surahNumber: 1, ayahNumber: 1, wordOrder: 1, text: 'بِسْمِ', ruleCode: null, demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 1, wordOrder: 2, text: 'اللَّهِ', ruleCode: 'GHUNNA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 1, wordOrder: 3, text: 'الرَّحْمَنِ', ruleCode: 'MUDD', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 1, wordOrder: 4, text: 'الرَّحِيمِ', ruleCode: 'MUDD', demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 2, wordOrder: 1, text: 'الْحَمْدُ', ruleCode: 'QALQALA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 2, wordOrder: 2, text: 'لِلَّهِ', ruleCode: 'GHUNNA', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 2, wordOrder: 3, text: 'رَبِّ', ruleCode: null, demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 2, wordOrder: 4, text: 'الْعَالَمِينَ', ruleCode: 'IKHFA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 3, wordOrder: 1, text: 'الرَّحْمَنِ', ruleCode: 'MUDD', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 3, wordOrder: 2, text: 'الرَّحِيمِ', ruleCode: 'MUDD', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 4, wordOrder: 1, text: 'مَالِكِ', ruleCode: 'IKHFA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 4, wordOrder: 2, text: 'يَوْمِ', ruleCode: null, demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 4, wordOrder: 3, text: 'الدِّينِ', ruleCode: 'IDGHAM', demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 5, wordOrder: 1, text: 'إِيَّاكَ', ruleCode: 'IZHAAR', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 5, wordOrder: 2, text: 'نَعْبُدُ', ruleCode: 'QALQALA', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 5, wordOrder: 3, text: 'وَإِيَّاكَ', ruleCode: 'IZHAAR', demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 5, wordOrder: 4, text: 'نَسْتَعِينُ', ruleCode: 'IKHFA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 6, wordOrder: 1, text: 'اهْدِنَا', ruleCode: null, demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 6, wordOrder: 2, text: 'الصِّرَاطَ', ruleCode: 'IKHFA', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 6, wordOrder: 3, text: 'الْمُسْتَقِيمَ', ruleCode: 'MUDD', demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 7, wordOrder: 1, text: 'صِرَاطَ', ruleCode: 'IKHFA', demoStatus: 'CORRECT' },
    { surahNumber: 1, ayahNumber: 7, wordOrder: 2, text: 'الَّذِينَ', ruleCode: 'GHUNNA', demoStatus: 'NEEDS_WORK' },
    { surahNumber: 1, ayahNumber: 7, wordOrder: 3, text: 'أَنْعَمْتَ', ruleCode: 'QALQALA', demoStatus: 'MISTAKE' },
    { surahNumber: 1, ayahNumber: 7, wordOrder: 4, text: 'عَلَيْهِمْ', ruleCode: 'IDGHAM', demoStatus: 'CORRECT' },
  ];

  for (const seg of tajweedSegments) {
    await prisma.tajweedWordSegment.upsert({
      where: {
        surahNumber_ayahNumber_wordOrder: {
          surahNumber: seg.surahNumber,
          ayahNumber: seg.ayahNumber,
          wordOrder: seg.wordOrder,
        },
      },
      update: seg,
      create: seg,
    });
  }

  const passwordHash = await bcrypt.hash('secret12', 10);
  const student = await prisma.user.upsert({
    where: { email: 'aisha.student@example.com' },
    update: {
      fullName: 'Aisha Khan',
      role: 'STUDENT',
      isEmailVerified: true,
    },
    create: {
      email: 'aisha.student@example.com',
      password: passwordHash,
      fullName: 'Aisha Khan',
      role: 'STUDENT',
      isEmailVerified: true,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      unreadMessages: 3,
      unreadNotifications: 1,
      onboardingComplete: true,
    },
    create: {
      userId: student.id,
      unreadMessages: 3,
      unreadNotifications: 1,
      onboardingComplete: true,
    },
  });

  const demoProgressSlugs = [
    'basic-islamic-studies',
    'quran-recitation',
    'nazra-quran',
  ];
  for (const slug of demoProgressSlugs) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) continue;
    await prisma.studentCourseProgress.upsert({
      where: {
        userId_courseSlug: { userId: student.id, courseSlug: slug },
      },
      create: {
        userId: student.id,
        courseSlug: slug,
        progressPercent: course.defaultProgressPercent || 30,
      },
      update: {},
    });
  }
}

async function seedTeacherPortal() {
  const passwordHash = await bcrypt.hash('secret12', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'aisha.teacher@example.com' },
    update: { fullName: 'Aisha Malik', role: 'TEACHER', isEmailVerified: true },
    create: {
      email: 'aisha.teacher@example.com',
      password: passwordHash,
      fullName: 'Aisha Malik',
      role: 'TEACHER',
      isEmailVerified: true,
    },
  });

  const students = await Promise.all(
    [
      { email: 'ahmed.hassan@example.com', fullName: 'Ahmed Hassan' },
      { email: 'aisha.student@example.com', fullName: 'Aisha Malik' },
      { email: 'yusuf.ahmed@example.com', fullName: 'Yusuf Ahmed' },
      { email: 'sara.ibrahim@example.com', fullName: 'Sara Ibrahim' },
      { email: 'bilal.nasir@example.com', fullName: 'Bilal Nasir' },
      { email: 'fatima.rahman@example.com', fullName: 'Fatima Rahman' },
      { email: 'omar.khan@example.com', fullName: 'Omar Khan' },
      { email: 'imran.hussain@example.com', fullName: 'Imran Hussain' },
    ].map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: { fullName: s.fullName, role: 'STUDENT', isEmailVerified: true },
        create: {
          email: s.email,
          password: passwordHash,
          fullName: s.fullName,
          role: 'STUDENT',
          isEmailVerified: true,
        },
      }),
    ),
  );

  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {
      rating: 4.9,
      ratingCount: 128,
      timeslotSlugs: ['morning', 'afternoon'],
      unreadMessages: 4,
      unreadNotifications: 2,
      onboardingComplete: true,
    },
    create: {
      userId: teacher.id,
      rating: 4.9,
      ratingCount: 128,
      timeslotSlugs: ['morning', 'afternoon'],
      unreadMessages: 4,
      unreadNotifications: 2,
      onboardingComplete: true,
    },
  });

  const existingClasses = await prisma.teacherClass.count({
    where: { teacherId: teacher.id },
  });
  if (existingClasses > 0) {
    return;
  }

  const date = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

  const classSeeds = [
    {
      title: 'Tajweed Basics',
      description: 'Tajweed fundamentals — Separate class',
      classType: 'SEPARATE',
      status: 'PENDING',
      scheduledDate: date(2025, 1, 15),
      startTime: '09:00',
      endTime: '10:00',
      studentIndexes: [0],
    },
    {
      title: 'Quran Memorization',
      description: 'Hifz session — Joint class',
      classType: 'JOINT',
      status: 'PENDING',
      scheduledDate: date(2025, 1, 15),
      startTime: '14:00',
      endTime: '15:00',
      studentIndexes: [1, 2],
    },
    {
      title: 'Surah Al-Baqarah',
      description: 'Tajweed & Memorization — Group Class',
      classType: 'GROUP',
      status: 'ACCEPTED',
      scheduledDate: date(2025, 1, 16),
      startTime: '09:00',
      endTime: '10:00',
      isGroupClass: true,
      studentIndexes: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
      title: 'Tafseer Studies',
      description: 'Quranic interpretation',
      classType: 'SEPARATE',
      status: 'COMPLETED',
      scheduledDate: date(2025, 1, 14),
      startTime: '09:00',
      endTime: '10:00',
      studentIndexes: [1],
    },
    {
      title: 'Hadith Science',
      description: 'Introduction to hadith sciences',
      classType: 'SEPARATE',
      status: 'COMPLETED',
      scheduledDate: date(2025, 1, 14),
      startTime: '11:00',
      endTime: '12:00',
      studentIndexes: [2],
    },
    {
      title: 'Islamic History',
      description: 'Early Islamic civilization',
      classType: 'SEPARATE',
      status: 'COMPLETED',
      scheduledDate: date(2025, 1, 13),
      startTime: '09:00',
      endTime: '10:00',
      studentIndexes: [3],
    },
    {
      title: 'Fiqh Fundamentals',
      description: 'Islamic jurisprudence basics',
      classType: 'SEPARATE',
      status: 'COMPLETED',
      scheduledDate: date(2025, 1, 12),
      startTime: '14:00',
      endTime: '15:00',
      studentIndexes: [4],
    },
  ];

  for (const seed of classSeeds) {
    await prisma.teacherClass.create({
      data: {
        teacherId: teacher.id,
        title: seed.title,
        description: seed.description,
        classType: seed.classType,
        status: seed.status,
        scheduledDate: seed.scheduledDate,
        startTime: seed.startTime,
        endTime: seed.endTime,
        isGroupClass: seed.isGroupClass ?? seed.studentIndexes.length > 1,
        completedAt: seed.status === 'COMPLETED' ? seed.scheduledDate : null,
        enrollments: {
          create: seed.studentIndexes.map((idx) => ({
            studentId: students[idx].id,
          })),
        },
      },
    });
  }

  const reviewSeeds = [
    { studentIdx: 1, rating: 5, comment: 'Excellent tajweed guidance and patience.' },
    { studentIdx: 2, rating: 4.8, comment: 'Very knowledgeable and punctual.' },
    { studentIdx: 3, rating: 5, comment: 'My children love her teaching style.' },
  ];

  for (const review of reviewSeeds) {
    const existing = await prisma.teacherReview.findFirst({
      where: {
        teacherId: teacher.id,
        studentId: students[review.studentIdx].id,
      },
    });
    if (!existing) {
      await prisma.teacherReview.create({
        data: {
          teacherId: teacher.id,
          studentId: students[review.studentIdx].id,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
