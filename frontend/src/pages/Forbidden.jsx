import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Forbidden.css';

export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <div className="forbidden-page">
      <div className="forbidden-container">
        <div className="forbidden-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1 className="forbidden-title">{t('forbidden.title')}</h1>
        <p className="forbidden-code">{t('forbidden.code')}</p>

        <p className="forbidden-message">
          {t('forbidden.messageLine1')}
          <br />
          {t('forbidden.messageLine2')}
        </p>

        <div className="forbidden-actions">
          <Link to="/login" className="forbidden-link">
            {t('forbidden.action')}
          </Link>
        </div>
      </div>
    </div>
  );
}
