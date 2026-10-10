import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type Language } from './i18n-context';
import { translations } from './translations';

const languageCookieName = 'bar_scan_language';
const defaultLanguage: Language = 'da';

function readLanguageCookie(): Language {
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${languageCookieName}=`));
  const value = match?.split('=')[1];
  return value === 'en' || value === 'da' ? value : defaultLanguage;
}

function writeLanguageCookie(language: Language) {
  document.cookie = `${languageCookieName}=${language};path=/;max-age=31536000;samesite=lax`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readLanguageCookie());

  useEffect(() => {
    document.documentElement.lang = language;
    writeLanguageCookie(language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key: string, values?: Record<string, string | number>) => {
      const dictionary = translations[language] as Record<string, string>;
      let text = dictionary[key] ?? (translations.en as Record<string, string>)[key] ?? key;

      if (values) {
        for (const [name, replacement] of Object.entries(values)) {
          text = text.replaceAll(`{{${name}}}`, String(replacement));
        }
      }

      return text;
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
