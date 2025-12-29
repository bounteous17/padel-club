import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, error } = useAuth();
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
    console.error('Google login failed');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Padel Club</h1>
          <p className="login-subtitle">Management System</p>
        </div>

        <div className="login-card">
          <h2>Sign In</h2>
          <p className="login-description">
            Sign in with your authorized Google account to access the dashboard.
          </p>

          {error && error !== 'ACCESS_DENIED' && (
            <div className="login-error">
              {error}
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
            />
          </div>

          <p className="login-note">
            Only authorized club administrators can access this system.
          </p>
        </div>
      </div>
    </div>
  );
}
