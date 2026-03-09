import type { TranslationKey } from './en';
import { en } from './en';
import { uk } from './uk';

type Locale = 'en' | 'uk';

const locales: Record<Locale, Record<TranslationKey, string>> = { en, uk };

let cachedLocale: Locale | null = null;

function getLocale(): Locale {
  if (!cachedLocale) {
    const env = process.env.TELEGRAM_LANG;
    cachedLocale = env === 'uk' ? 'uk' : 'en';
  }
  return cachedLocale;
}

export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let message = locales[getLocale()][key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return message;
}

export function tStatus(dbName: string): string {
  const key = `status.${dbName}` as TranslationKey;
  const translations = locales[getLocale()];
  return key in translations
    ? translations[key]
    : translations['status.fallback'];
}
