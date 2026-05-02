import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './resources/en';
import es from './resources/es';

export const SUPPORTED_LANGUAGES = ['en', 'es'];
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'ui_language';

function mapToSupportedLanguage(candidate) {
  if (!candidate || typeof candidate !== 'string') {
    return null;
  }

  const normalized = candidate.toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
}

export function resolveInitialLanguage() {
  if (globalThis.window === undefined) {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = mapToSupportedLanguage(
    globalThis.window.localStorage.getItem(LANGUAGE_STORAGE_KEY),
  );
  if (storedLanguage) {
    return storedLanguage;
  }

  const browserCandidates = [
    ...(Array.isArray(globalThis.window.navigator.languages)
      ? globalThis.window.navigator.languages
      : []),
    globalThis.window.navigator.language,
  ];

  for (const language of browserCandidates) {
    const mappedLanguage = mapToSupportedLanguage(language);
    if (mappedLanguage) {
      return mappedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
