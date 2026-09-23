import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();

  const steps = [
    { icon: '1️⃣', title: t('home.step1Title', '1. Enter Food Details'), desc: t('home.step1Desc', 'Select a preset food or enter moisture, fat, acidity, storage temperature, and desired shelf life.') },
    { icon: '2️⃣', title: t('home.step2Title', '2. Analyze Packaging Needs'), desc: t('home.step2Desc', 'Domain safety rules filter unsuitable films, while the CPU machine-learning model evaluates compatibility.') },
    { icon: '3️⃣', title: t('home.step3Title', '3. Understand Recommendation'), desc: t('home.step3Desc', 'Review the recommended material, clear reasons why it matches, score breakdowns, and eco/cost alternatives.') },
  ];

  const features = [
    { icon: '🛡️', title: t('home.whyRulesTitle', 'Domain Safety Rules'), desc: t('home.whyRulesDesc', 'Hard constraints prevent unsafe recommendations (e.g., bare aluminum on high-acid foods or non-permeable films for respiring fruits).') },
    { icon: '🤖', title: t('home.whyMlTitle', 'Machine-Learning Guidance'), desc: t('home.whyMlDesc', 'A fast Random Forest model assists candidate scoring based on training patterns, running locally on CPU.') },
    { icon: '🌿', title: t('home.whySustTitle', 'Sustainability & Cost'), desc: t('home.whySustDesc', 'Automatically ranks lower-cost and high-recyclability alternatives alongside the primary recommended match.') },
    { icon: '🔍', title: t('home.whyExplainTitle', '100% Explainable'), desc: t('home.whyExplainDesc', 'No black-box answers. View exact reasons, barrier values, triggered rules, and literature citations.') },
  ];

  const dataItems = [
    { title: t('home.dataLitTitle', 'Literature-Backed Data'), desc: t('home.dataLitDesc', 'Barrier properties sourced from Robertson (2012) and Massey (2003).') },
    { title: t('home.dataSynthTitle', 'Synthetic Demonstration Data'), desc: t('home.dataSynthDesc', 'ML training records are explicitly labeled as synthetic demonstration data.') },
    { title: t('home.dataSimTitle', 'Simulated Sensor Data'), desc: t('home.dataSimDesc', 'IoT telemetry is generated via simulator. Physical hardware validation is pending.') },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero-section">
        <span className="badge badge-green" style={{ marginBottom: '1rem' }}>{t('home.badge', '🌱 Sustainable & AI-Assisted Packaging')}</span>
        <h1 className="hero-title">
          <span className="gradient-text">{t('home.title1', 'SMART FOOD PACKAGING')}</span>
          <br />{t('home.title2', 'RECOMMENDATION SYSTEM')}
        </h1>
        <p className="hero-subtitle">
          {t('home.subtitle', 'AI-assisted packaging selection based on food properties, storage conditions, cost, sustainability, and packaging barrier requirements.')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/analyze" className="btn btn-primary btn-lg" id="cta-start-analysis">
            <span>🚀</span> {t('home.startAnalysis', 'Start Analysis')}
          </Link>
          <Link to="/compare" className="btn btn-secondary btn-lg" id="cta-explore-materials">
            <span>📋</span> {t('home.exploreMaterials', 'Explore Materials')}
          </Link>
        </div>
      </section>

      {/* 3 Steps */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
            {t('home.howItWorksTitle', 'How It Works in 3 Simple Steps')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('home.howItWorksSubtitle', 'Clear, explainable decisions from food properties to final material match.')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {steps.map((s, i) => (
            <div key={i} className={`card card-hover fade-in-up stagger-${i + 1}`} style={{ borderTop: '3px solid var(--primary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="card card-accent">
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '1.25rem' }}>{t('home.whyTitle', 'Why Use This System?')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} className={`fade-in-up stagger-${i + 1}`}>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{f.icon} {f.title}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Transparency */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>📊 {t('home.dataTransTitle', 'Data Transparency')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {dataItems.map((d, i) => (
              <div key={i}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{d.title}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IoT Preview */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card card-surface">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>🌡️ {t('monitor.pageTitle', 'Real-Time Storage Monitoring')}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {t('monitor.pageSubtitle', 'After packaging selection, monitor storage conditions in real time. The IoT dashboard tracks temperature, humidity, and CO₂ levels, alerting when conditions drift from the recommended baseline.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge badge-green">✅ NORMAL</span>
            <span className="badge badge-warning">⚠️ WATCH</span>
            <span className="badge badge-error">🔴 WARNING</span>
          </div>
          <Link to="/monitor" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('nav.monitor', 'Monitor')} →
          </Link>
        </div>
      </section>

      {/* Methodology */}
      <section className="card card-surface" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-heading)' }}>💡 {t('footer.architecture', 'Lightweight CPU architecture running on AMD Ryzen 5 5500U.')}</strong>
        <p style={{ marginTop: '0.25rem' }}>
          {t('footer.disclaimer', 'Decision-support prototype for food technology and sustainable packaging education.')}
        </p>
      </section>
    </div>
  );
}

