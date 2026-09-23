import { Link } from 'react-router-dom';

const steps = [
  { icon: '1️⃣', title: '1. Enter Food Details', desc: 'Select a preset food or enter moisture, fat, acidity, storage temperature, and desired shelf life.' },
  { icon: '2️⃣', title: '2. Analyze Packaging Needs', desc: 'Domain safety rules filter unsuitable films, while the CPU machine-learning model evaluates compatibility.' },
  { icon: '3️⃣', title: '3. Understand Recommendation', desc: 'Review the recommended material, clear reasons why it matches, score breakdowns, and eco/cost alternatives.' },
];

const features = [
  { icon: '🛡️', title: 'Domain Safety Rules', desc: 'Hard constraints prevent unsafe recommendations (e.g., bare aluminum on high-acid foods or non-permeable films for respiring fruits).' },
  { icon: '🤖', title: 'Machine-Learning Guidance', desc: 'A fast Random Forest model assists candidate scoring based on training patterns, running locally on CPU.' },
  { icon: '🌿', title: 'Sustainability & Cost', desc: 'Automatically ranks lower-cost and high-recyclability alternatives alongside the primary recommended match.' },
  { icon: '🔍', title: '100% Explainable', desc: 'No black-box answers. View exact reasons, barrier values, triggered rules, and literature citations.' },
];

const dataItems = [
  { title: 'Literature-Backed Data', desc: 'Barrier properties sourced from Robertson (2012) and Massey (2003).' },
  { title: 'Synthetic Demonstration Data', desc: 'ML training records are explicitly labeled as synthetic demonstration data.' },
  { title: 'Simulated Sensor Data', desc: 'IoT telemetry is generated via simulator. Physical hardware validation is pending.' },
];

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero-section">
        <span className="badge badge-green" style={{ marginBottom: '1rem' }}>🌱 Sustainable & AI-Assisted Packaging</span>
        <h1 className="hero-title">
          <span className="gradient-text">SMART FOOD PACKAGING</span>
          <br />RECOMMENDATION SYSTEM
        </h1>
        <p className="hero-subtitle">
          AI-assisted packaging selection based on food properties, storage conditions, cost, sustainability, and packaging barrier requirements.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/analyze" className="btn btn-primary btn-lg" id="cta-start-analysis">
            <span>🚀</span> Start Analysis
          </Link>
          <Link to="/compare" className="btn btn-secondary btn-lg" id="cta-explore-materials">
            <span>📋</span> Explore Materials
          </Link>
        </div>
      </section>

      {/* 3 Steps */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
            How It Works in 3 Simple Steps
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Clear, explainable decisions from food properties to final material match.
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
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '1.25rem' }}>Why Use This System?</h2>
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>📊 Data Transparency</h2>
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>🌡️ Real-Time Storage Monitoring</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            After packaging selection, monitor storage conditions in real time. The IoT dashboard tracks temperature, humidity, and CO₂ levels, alerting when conditions drift from the recommended baseline.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge badge-green">✅ NORMAL</span>
            <span className="badge badge-warning">⚠️ WATCH</span>
            <span className="badge badge-error">🔴 WARNING</span>
          </div>
          <Link to="/monitor" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 600 }}>
            Open Storage Monitor →
          </Link>
        </div>
      </section>

      {/* Methodology */}
      <section className="card card-surface" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-heading)' }}>💡 Methodology & Performance Note:</strong>
        <p style={{ marginTop: '0.25rem' }}>
          This application uses verified packaging data from Robertson (2012) and Massey (2003) alongside demonstration synthetic test cases. Compatibility scores reflect project-defined multi-criteria ratings and should not be used as clinical shelf-life certification. Designed for CPU execution on AMD Ryzen 5 5500U.
        </p>
      </section>
    </div>
  );
}
