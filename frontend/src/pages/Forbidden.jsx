import { Link } from 'react-router-dom';
import './Forbidden.css';

export default function Forbidden() {
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

        <h1 className="forbidden-title">Access Denied</h1>
        <p className="forbidden-code">403 Forbidden</p>

        <p className="forbidden-message">
          Your email is not authorized to access this application.
          Only club administrators can sign in.
        </p>

        <div className="forbidden-actions">
          <Link to="/login" className="forbidden-link">
            Try Another Account
          </Link>
        </div>
      </div>
    </div>
  );
}
