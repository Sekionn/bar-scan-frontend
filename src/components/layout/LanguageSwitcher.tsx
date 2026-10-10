import { useTranslation } from '../../i18n/useTranslation';
import type { Language } from '../../i18n/i18n-context';

const languageFlags: Record<Language, string> = {
  da: 'flag-denmark',
  en: 'flag-union-jack',
};

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const nextLanguage: Language = language === 'da' ? 'en' : 'da';
  const labelKey = nextLanguage === 'da' ? 'app.language.switchToDanish' : 'app.language.switchToEnglish';

  return (
    <div className="language-switcher" aria-label={t('app.language.label')}>
      <button
        aria-label={t(labelKey)}
        className="language-button"
        onClick={() => setLanguage(nextLanguage)}
        title={t(labelKey)}
        type="button"
      >
        <span className={`flag-icon ${languageFlags[language]}`} aria-hidden="true" />
      </button>
    </div>
  );
}
