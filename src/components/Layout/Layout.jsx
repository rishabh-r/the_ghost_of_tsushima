import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <div className="bg-decoration">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>

      <nav className="navbar glass">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">SpecCrew</span>
          <span className="logo-badge">AI</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        </div>

        <div className="nav-right">
          <div className="nav-status">
            <span className="status-dot" />
            AI Ready
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
