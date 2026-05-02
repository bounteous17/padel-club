import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, error } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await login(credentialResponse.credential);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else if (result.error === 'ACCESS_DENIED') {
      navigate('/forbidden', { replace: true });
    }
  };

  const handleGoogleError = () => {
    console.error(t('auth.googleLoginFailed'));
  };

  const errorMessage =
    error === 'Authentication failed' ? t('auth.errors.authenticationFailed') : error;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">{t('login.appTitle')}</h1>
          <p className="login-subtitle">{t('login.appSubtitle')}</p>
        </div>

        <div className="login-card">
          <h2>{t('login.signInTitle')}</h2>
          <p className="login-description">
            {t('login.description')}
          </p>

          {error && error !== 'ACCESS_DENIED' && (
            <div className="login-error">
              {errorMessage}
            </div>
          )}

          <div className="google-button-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              width="300"
              text="signin_with"
              shape="rectangular"
              locale={i18n.language}
            />
          </div>

          <p className="login-note">
            {t('login.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
