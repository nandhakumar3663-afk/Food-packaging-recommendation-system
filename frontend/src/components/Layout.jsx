import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

/* ── Toast Context ── */
const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

/* ── Theme Context ── */
const ThemeContext = createContext(null);
export function useTheme() { return useContext(ThemeContext); }

let toastId = 0;

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 4000);
  }, []);

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/compare', label: 'Materials' },
    { to: '/history', label: 'History' },
    { to: '/monitor', label: 'Monitor' },
  ];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
    <ToastContext.Provider value={showToast}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Navbar ── */}
      <header className="navbar" role="banner">
        <nav className="navbar-inner" aria-label="Main Navigation">
          <NavLink to="/home" className="brand" aria-label="Smart Food Packaging Home">
            <div className="brand-icon" aria-hidden="true">🌱</div>
            <div>
              <span className="brand-title">Smart Food Packaging</span>
              <span className="brand-tagline">AI & Rule-Based Material Selection</span>
            </div>
          </NavLink>

          <ul className="nav-links" role="menubar">
            {navItems.map(item => (
              <li key={item.to} role="none">
                <NavLink
                  to={item.to}
                  role="menuitem"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li role="none">
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle dark mode">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{ display: 'none' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(p => !p)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ── */}
      <div id="mobile-menu" className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <button className="theme-toggle" onClick={toggleTheme} style={{ marginTop: '1rem' }}>
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* ── Main ── */}
      <main className="main-content" id="main-content">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <strong style={{ color: 'var(--text-heading)' }}>🌱 Smart Food Packaging Recommendation System</strong>
            <p style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
              Lightweight CPU architecture running on AMD Ryzen 5 5500U. Domain rules + Scikit-Learn Random Forest.
            </p>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Decision-support prototype for food technology and sustainable packaging education.
          </div>
        </div>
      </footer>

      {/* ── Toast Container ── */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' toast-exit' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}
