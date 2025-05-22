export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];

export async function getMessages(locale: Locale | string) {
  const localeToUse = (locales.includes(locale as Locale)) ? locale : 'ru';
  return (await import(`../messages/${localeToUse}.json`)).default;
} 