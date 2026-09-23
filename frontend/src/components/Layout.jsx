import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

/* ── Toast Context ── */
const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

/* ── Theme Context ── */
const ThemeContext = createContext(null);
export function useTheme() { return useContext(ThemeContext); }

let toastId = 0;

export default function Layout() {
  const location = useLocation();
  const { lang, setLang, t, languages } = useLanguage();
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
    { to: '/home', label: t('nav.home', 'Home') },
    { to: '/analyze', label: t('nav.analyze', 'Analyze') },
    { to: '/compare', label: t('nav.materials', 'Materials') },
    { to: '/history', label: t('nav.history', 'History') },
    { to: '/monitor', label: t('nav.monitor', 'Monitor') },
  ];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
    <ToastContext.Provider value={showToast}>
      <a href="#main-content" className="skip-link">{t('nav.skipToContent', 'Skip to main content')}</a>

      {/* ── Navbar ── */}
      <header className="navbar" role="banner">
        <nav className="navbar-inner" aria-label="Main Navigation">
          <NavLink to="/home" className="brand" aria-label={t('nav.brandTitle', 'Smart Food Packaging')}>
            <div className="brand-icon" aria-hidden="true">🌱</div>
            <div>
              <span className="brand-title">{t('nav.brandTitle', 'Smart Food Packaging')}</span>
              <span className="brand-tagline">{t('nav.brandTagline', 'AI & Rule-Based Material Selection')}</span>
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
            
            {/* Language Switcher */}
            <li role="none" className="lang-switcher-item">
              <div className="lang-dropdown-wrapper">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="lang-select-input"
                  aria-label={t('nav.toggleLang', 'Select Language')}
                  title={t('nav.toggleLang', 'Select Language')}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.native}
                    </option>
                  ))}
                </select>
              </div>
            </li>

            <li role="none">
              <button className="theme-toggle" onClick={toggleTheme} aria-label={t('nav.toggleTheme', 'Toggle theme')} title={t('nav.toggleTheme', 'Toggle dark mode')}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="mobile-lang-wrapper" style={{ display: 'none' }}>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="lang-select-input"
                aria-label={t('nav.toggleLang', 'Select Language')}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.native}
                  </option>
                ))}
              </select>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={t('nav.toggleTheme', 'Toggle theme')} style={{ display: 'none' }}>
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

        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🌐 {t('nav.toggleLang', 'Language')}:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="lang-select-input"
              style={{ flex: 1 }}
              aria-label={t('nav.toggleLang', 'Select Language')}
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="main-content" id="main-content">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <strong style={{ color: 'var(--text-heading)' }}>🌱 {t('footer.brand', 'Smart Food Packaging Recommendation System')}</strong>
            <p style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
              {t('footer.architecture', 'Lightweight CPU architecture running on AMD Ryzen 5 5500U. Domain rules + Scikit-Learn Random Forest.')}
            </p>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t('footer.disclaimer', 'Decision-support prototype for food technology and sustainable packaging education.')}
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

