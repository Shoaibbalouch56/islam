export interface DailyContent {
  text: string;
  source: string;
}

export const DAILY_HADITHS: DailyContent[] = [
  {
    text: 'The best among you are those who learn the Quran and teach it.',
    source: 'Sahih al-Bukhari 5027',
  },
  {
    text: 'The deeds most loved by Allah are those done regularly, even if they are small.',
    source: 'Sahih al-Bukhari 6464',
  },
  {
    text: 'None of you truly believes until he loves for his brother what he loves for himself.',
    source: 'Sahih al-Bukhari 13',
  },
  {
    text: 'A good word is charity.',
    source: 'Sahih al-Bukhari 2989',
  },
  {
    text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    source: 'Sahih al-Bukhari 6018',
  },
  {
    text: 'The strong person is not the one who overcomes people by his strength, but the one who controls himself while in anger.',
    source: 'Sahih al-Bukhari 6114',
  },
  {
    text: 'Make things easy and do not make things difficult, give glad tidings and do not repel people.',
    source: 'Sahih al-Bukhari 69',
  },
  {
    text: 'Allah does not look at your appearance or wealth, but rather at your hearts and deeds.',
    source: 'Sahih Muslim 2564',
  },
  {
    text: 'He who does not thank people, does not thank Allah.',
    source: 'Sunan Abi Dawud 4811',
  },
  {
    text: 'The most beloved of people to Allah are those who are most beneficial to people.',
    source: 'Al-Mu’jam al-Awsat 6026',
  },
];

export function getDailyContent(date = new Date()): DailyContent {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return DAILY_HADITHS[dayOfYear % DAILY_HADITHS.length];
}
