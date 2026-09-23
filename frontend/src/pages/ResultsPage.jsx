import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Layout';

export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [techOpen, setTechOpen] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const raw = sessionStorage.getItem('last_packaging_result');
    if (raw) { try { setData(JSON.parse(raw)); } catch (e) { console.error(e); } }
  }, []);

  if (!data) return (
    <div className="page-enter" style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
      <h1 className="page-title">No Results Available</h1>
      <p className="page-subtitle" style={{ margin: '0 auto 2rem' }}>Run an analysis first to see packaging recommendations.</p>
      <Link to="/analyze" className="btn btn-primary btn-lg">🚀 Start Analysis</Link>
    </div>
  );

  const a = data.analysis || {};
  const recs = data.recommendations || {};
  const primary = recs.recommended_match || {};
  const m = primary.material || {};
  const sub = primary.subscores || {};
  const cost = primary.cost_analysis || {};
  const sust = primary.sustainability_analysis || {};
  const pkg = data.packaging_requirements || {};
  const ml = data.ml_assessment || {};
  const reasons = primary.reasons || [];
  const factors = primary.key_factors || [];
  const rules = primary.triggered_rules || [];
  const altKeys = [
    { key: 'alternative_match', title: 'Alternative Match', icon: '🔄' },
    { key: 'lower_cost_alternative', title: 'Lower-Cost', icon: '💰' },
    { key: 'sustainability_oriented_alternative', title: 'Sustainability', icon: '🌿' },
  ];
  const profileName = (a.preference_profile || 'balanced').replace(/_/g, ' ');
  const score = parseFloat(primary.compatibility_score || 0).toFixed(1);

  const scoreItems = [
    { label: 'Oxygen Barrier', val: sub.oxygen },
    { label: 'Moisture Barrier', val: sub.moisture },
    { label: 'Shelf Life', val: sub.shelf_life },
    { label: 'Mechanical', val: sub.mechanical },
    { label: 'Sealability', val: sub.sealability },
    { label: 'Sustainability', val: sub.sustainability },
    { label: 'Cost', val: sub.cost },
  ];

  const profiles = data.cross_profile_comparison || data.profile_comparison || [];

  return (
    <div className="page-enter" style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">Analysis Complete</span>
              <span className="badge badge-neutral">Profile: {profileName}</span>
              <span className="badge badge-info">{(m.source || '').toUpperCase().includes('SYNTHETIC') ? 'Synthetic Data' : 'Literature-Backed'}</span>
            </div>
            <h1 className="page-title">Recommendation Results</h1>
            <p className="page-subtitle">Evaluating optimal packaging materials for <strong>{a.food || 'your food product'}</strong>.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/report" className="btn btn-secondary btn-sm">📄 Printable Report</Link>
            <Link to="/analyze" className="btn btn-outline btn-sm">🔄 New Analysis</Link>
          </div>
        </div>
      </div>

      {/* Key Requirements */}
      <section className="card card-surface" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>🎯 Key Packaging Requirements</h2>
          <span className="badge badge-green">Target: {a.target_shelf_life || 30} Days</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Oxygen Barrier Demand', val: pkg.critical_o2_barrier_needed || 'Standard' },
            { label: 'Moisture Vapor Demand', val: pkg.critical_wvtr_barrier_needed || 'Standard' },
            { label: 'Mechanical Protection', val: pkg.mechanical_protection_demand || 'Standard' },
            { label: 'Gas Exchange', val: pkg.gas_exchange_demand || 'Hermetic Seal' },
          ].map((r, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.label}</span>
              <strong style={{ color: 'var(--text-heading)', fontSize: '0.9rem' }}>{r.val}</strong>
            </div>
          ))}
        </div>
        {pkg.summary_text && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5, marginBottom: 0 }}>{pkg.summary_text}</p>}
      </section>

      {/* Hero Match */}
      <section className="hero-match-card" style={{ marginBottom: '2rem' }}>
        <div className="match-header">
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-green">🌟 #1 RECOMMENDED MATCH</span>
            </div>
            <h2 className="match-name">{m.material_name || 'Loading...'}</h2>
            <span className="badge badge-neutral" style={{ marginTop: '0.4rem' }}>{m.material_category || 'Category'}</span>
          </div>
          <div className="match-score-badge">
            <div className="match-score-num">{score}%</div>
            <div className="match-score-label">Compatibility Score</div>
          </div>
        </div>

        {/* Why */}
        {reasons.length > 0 && (
          <div style={{ background: 'var(--primary-surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-accent)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>Why did the system recommend this?</h3>
            <ul className="reasons-list">
              {reasons.map((r, i) => (
                <li key={i} className="reason-item fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="reason-bullet">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cost & Sustainability */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>💰 Cost Analysis</h4>
              <span className="badge badge-neutral">{cost.cost_tier || 'Moderate'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                ${(cost.unit_package_cost_usd ?? (m.estimated_cost || 0) * 0.05).toFixed(4)}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ unit package (0.05m²)</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Material benchmark: ${(cost.cost_per_sq_meter ?? m.estimated_cost ?? 0).toFixed(2)} / m²
            </p>
            <div style={{ background: 'var(--primary-surface)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.6rem', border: '1px dashed var(--border-default)', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMATED BENCHMARK — NOT A COMMERCIAL QUOTE</span>
            </div>
          </div>

          <div className="card" style={{ borderTop: '3px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>🌿 Sustainability Index</h4>
              <span className="badge badge-green">{parseFloat(sust.sustainability_index || 0).toFixed(0)} / 100</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Recyclability: {sust.recyclability_score ?? m.recyclability ?? '--'}% • Bio-Renewable: {sust.renewable_content_score ?? m.renewable_content ?? '--'}%
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-heading)', fontWeight: 600 }}>
              End-of-life: {sust.end_of_life_pathway || 'Standard municipal sorting'}
            </p>
          </div>
        </div>

        {/* ML Assessment */}
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🤖</div>
          <div>
            <strong style={{ color: 'var(--text-heading)', fontSize: '0.95rem' }}>Machine-Learning Assessment</strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {ml.summary || 'The Random Forest candidate model evaluated this item locally on CPU.'}
            </p>
            <span className="badge badge-info" style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
              {ml.data_label || 'Synthetic Demonstration Data'}
            </span>
          </div>
        </div>

        {/* Key Factors */}
        {factors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>Key Factors Considered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {factors.map((f, i) => (
                <div key={i} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--primary)' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{typeof f === 'string' ? f : f.description || f.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>Compatibility Breakdown by Criterion</h3>
          <div className="score-breakdown-grid">
            {scoreItems.map((s, i) => (
              <div key={i} className="score-bar-item">
                <div className="score-bar-header">
                  <span>{s.label}</span>
                  <span>{Math.round(s.val || 0)}%</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${s.val || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Accordion */}
        <div className={`accordion${techOpen ? ' open' : ''}`}>
          <button type="button" className="accordion-header" onClick={() => setTechOpen(p => !p)}>
            <span>⚙️ View Technical & Scientific Details</span>
            <span className="accordion-icon">{techOpen ? '▲' : '▼'}</span>
          </button>
          <div className="accordion-content" style={techOpen ? { maxHeight: 2000, padding: '1.25rem' } : {}}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>Barrier & Material Specifications</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Property</th><th>Value</th><th>Unit</th></tr>
                </thead>
                <tbody>
                  <tr><td>OTR</td><td>{m.otr ?? '--'}</td><td>cc/m²/day</td></tr>
                  <tr><td>WVTR</td><td>{m.wvtr ?? '--'}</td><td>g/m²/day</td></tr>
                  <tr><td>Thickness</td><td>{m.thickness ?? '--'}</td><td>μm</td></tr>
                  <tr><td>Tensile Strength</td><td>{m.tensile_strength ?? '--'}</td><td>MPa</td></tr>
                  <tr><td>Seal Temperature</td><td>{m.seal_temperature ?? '--'}</td><td>°C</td></tr>
                </tbody>
              </table>
            </div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Triggered Domain Safety Rules</h4>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', paddingLeft: '1.25rem' }}>
              {rules.length === 0
                ? <li>All criteria passed without restrictive penalties.</li>
                : rules.map((r, i) => <li key={i}><strong>[{r.rule_id}] {r.name}:</strong> {r.reason}</li>)
              }
            </ul>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Data Provenance</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {m.source || 'Literature reference: Robertson (2012) & Massey (2003).'}
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Profile Comparison */}
      {profiles.length > 0 && (
        <section className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem', borderTop: '3px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
            🔄 Cross-Profile Comparison
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            See how the top-ranked packaging changes depending on organizational objectives:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {profiles.map((p, i) => (
              <div key={i} className="card card-hover" style={{ borderTop: `3px solid ${p.is_active ? 'var(--primary)' : 'var(--border-default)'}` }}>
                <span className={`badge ${p.is_active ? 'badge-green' : 'badge-neutral'}`} style={{ marginBottom: '0.5rem' }}>{p.profile_name}</span>
                <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.material_name}</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Score: {parseFloat(p.score || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alternatives */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
          Alternative Packaging Materials
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Depending on your budget or sustainability targets, here are viable alternatives:
        </p>
        <div className="alternatives-grid">
          {altKeys.map(({ key, title, icon }) => {
            const alt = recs[key];
            if (!alt || !alt.material) return null;
            return (
              <div key={key} className="alternative-card">
                <div>
                  <span className="badge badge-neutral" style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>{icon} {title}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>{alt.material.material_name}</h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{alt.material.material_category}</span>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {parseFloat(alt.compatibility_score || 0).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ${(alt.material.estimated_cost || 0).toFixed(2)}/m²
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="card card-surface" style={{ marginBottom: '2.5rem', padding: '1.5rem', border: '1px dashed var(--primary)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</span>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>Model Limitations & Operational Scope</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              This system is developed for academic evaluation on standard CPU hardware.
            </p>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: '1.25rem' }}>
              <li><strong>Domain Safety Precedence:</strong> Domain rules strictly override ML rankings.</li>
              <li><strong>Synthetic ML Dataset:</strong> ML models were trained on synthetic demonstration patterns.</li>
              <li><strong>Commercial Testing Required:</strong> Physical shelf-life trials and regulatory compliance are mandatory before distribution.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
