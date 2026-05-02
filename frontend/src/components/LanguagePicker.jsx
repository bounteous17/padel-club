import { useTranslation } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY } from '../i18n';
import './LanguagePicker.css';

export default function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const selectedLanguage = (i18n.resolvedLanguage || i18n.language || 'en')
    .toLowerCase()
    .split('-')[0];

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  return (
    <label className="language-picker">
      <span className="language-picker-label">{t('common.languageLabel')}</span>
      <select
        className="language-picker-select"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        aria-label={t('common.languageLabel')}
      >
        <option value="en">{t('common.english')}</option>
        <option value="es">{t('common.spanish')}</option>
      </select>
    </label>
  );
}
