const { PrismaClient } = require('@prisma/client');
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
    sortOrder: 1,
  },
  {
    slug: 'hifz-program',
    title: 'Hifz Program',
    description: 'Complete memorization of the Holy Quran with certified teachers.',
    duration: null,
    icon: 'scroll',
    thumbnail: null,
    sortOrder: 2,
  },
  {
    slug: 'tajweed-rules',
    title: 'Tajweed Rules',
    description: 'Master the art of Quran recitation with correct articulation.',
    duration: '3 months',
    icon: 'graduation-cap',
    thumbnail: null,
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
  console.log('Seed complete: regions, languages, courses, timeslots, plans, addons, coupons');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
