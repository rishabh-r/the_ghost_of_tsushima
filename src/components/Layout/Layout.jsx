import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <div className="bg-decoration">
        <motion.div
          className="bg-blob bg-blob-1"
          animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-blob bg-blob-2"
          animate={{ y: [0, 14, 0], x: [0, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-blob bg-blob-3"
          animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.nav
        className="navbar glass"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
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
      </motion.nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
