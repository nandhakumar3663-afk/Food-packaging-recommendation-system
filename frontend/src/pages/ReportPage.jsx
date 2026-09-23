import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      const recId = searchParams.get('id');
      let fullResult = null;

      if (recId) {
        try {
          const res = await api.getHistoryById(recId);
          if (res?.success && res.recommendation) {
            const r = res.recommendation;
            let snap = {};
            try { snap = typeof r.input_snapshot === 'string' ? JSON.parse(r.input_snapshot) : (r.input_snapshot || {}); } catch {}
            let rules = [];
            try { rules = typeof r.triggered_rules === 'string' ? JSON.parse(r.triggered_rules) : (r.triggered_rules || []); } catch {}

            fullResult = {
              recommendation_id: r.recommendation_id,
              created_at: r.created_at,
              analysis: { food: r.food_name, category: r.category, moisture: snap.moisture ?? 50, fat: snap.fat ?? 5, ph: snap.ph ?? 6.0, respiration_rate: snap.respiration_rate || 'None', target_shelf_life: snap.target_shelf_life || 30, storage_temperature: snap.storage_temperature ?? 20, storage_rh: snap.storage_rh ?? 60, storage_type: snap.storage_type || 'Ambient', transport_condition: snap.transport_condition || 'Standard Ambient', oxygen_sensitivity: snap.oxygen_sensitivity || 'Medium', moisture_sensitivity: snap.moisture_sensitivity || 'Medium', light_sensitivity: snap.light_sensitivity || 'Low', preference_profile: snap.preference_profile || 'balanced' },
              recommendations: {
                recommended_match: {
                  material: { material_name: r.material_name, material_category: r.material_category, polymer_type: r.polymer_type, otr: r.otr, wvtr: r.wvtr, thickness: r.thickness, estimated_cost: r.estimated_cost, recyclability: r.recyclability, renewable_content: r.renewable_content, source: r.material_source },
                  compatibility_score: r.compatibility_score,
                  subscores: { oxygen: r.oxygen_score, moisture: r.moisture_score, shelf_life: r.shelf_life_score, mechanical: snap.mechanical_score || 80, sealability: snap.sealability_score || 85, sustainability: snap.sustainability_score || 70, cost: r.cost_score },
                  cost_analysis: { cost_per_sq_meter: r.estimated_cost || 0.18, unit_package_cost_usd: (r.estimated_cost || 0.18) * 0.05, cost_tier: (r.estimated_cost || 0.18) < 0.15 ? 'Budget' : (r.estimated_cost || 0.18) < 0.35 ? 'Moderate' : 'Premium' },
                  sustainability_analysis: { sustainability_index: (r.recyclability || 50) * 0.4 + (r.renewable_content || 0) * 0.35 + 15, recyclability_score: r.recyclability || 50, renewable_content_score: r.renewable_content || 0, end_of_life_pathway: 'Standard municipal sorting stream' },
                  reasons: (r.reason || '').split('; ').filter(Boolean),
                  triggered_rules: rules,
                },
              },
              packaging_requirements: snap.packaging_requirements || {},
            };
          }
        } catch {}
      }

      if (!fullResult) {
        const raw = sessionStorage.getItem('last_packaging_result');
        if (raw) try { fullResult = JSON.parse(raw); } catch {}
      }

      setData(fullResult);
    };
    loadReport();
  }, [searchParams]);

  if (!data) return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
      <h1 className="page-title">No Report Data</h1>
      <p className="page-subtitle" style={{ margin: '0 auto 2rem' }}>Run an analysis or select a history item to generate a printable report.</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <Link to="/analyze" className="btn btn-primary">🚀 Start Analysis</Link>
        <Link to="/history" className="btn btn-secondary">📋 View History</Link>
      </div>
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
  const score = parseFloat(primary.compatibility_score || 0).toFixed(1);
  const profileName = (a.preference_profile || 'balanced').replace(/_/g, ' ').toUpperCase();

  const Section = ({ num, title, children }) => (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '0.92rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-accent)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
        {num}. {title}
      </h2>
      {children}
    </div>
  );

  const InfoGrid = ({ items }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
      {items.map((item, i) => (
        <div key={i}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>{item.label}</span>
          <strong style={{ color: 'var(--text-primary)' }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Toolbar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/results" className="btn btn-secondary btn-sm">← Back to Results</Link>
          <Link to="/history" className="btn btn-outline btn-sm">Audit History</Link>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary">🖨️ Print / Save PDF</button>
      </div>

      {/* Report Document */}
      <div className="card card-accent" style={{ background: 'var(--bg-surface)', padding: '2.5rem', lineHeight: 1.55 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.25rem', borderBottom: '2px solid var(--primary)', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.35rem' }}>Official Audit Record</span>
            <h1 style={{ fontSize: '1.65rem', color: 'var(--text-heading)', fontWeight: 800, margin: '0.25rem 0' }}>SMART FOOD PACKAGING REPORT</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Multi-Attribute Decision Intelligence & Hybrid Rule-ML Assessment</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Analysis ID</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>#{data.recommendation_id || 'CURRENT'}</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.created_at || new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '1.75rem', background: 'var(--primary-surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-accent)' }}>
          <h2 style={{ fontSize: '0.92rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>Executive Summary</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
            For {a.food || 'the evaluated food'} stored under {a.storage_type || 'ambient'} conditions ({a.storage_temperature ?? 20}°C, {a.storage_rh ?? 60}% RH) requiring a {a.target_shelf_life || 30}-day shelf-life, <strong>{m.material_name || 'the recommended material'}</strong> is the optimal packaging solution with a compatibility score of {score}%.
          </p>
        </div>

        <Section num={3} title="Input Food Profile">
          <InfoGrid items={[
            { label: 'Food Commodity', value: a.food || '—' },
            { label: 'Category', value: a.category || '—' },
            { label: 'Moisture', value: `${a.moisture ?? '—'}%` },
            { label: 'Fat', value: `${a.fat ?? '—'}%` },
            { label: 'pH', value: a.ph ?? '—' },
            { label: 'Respiration', value: a.respiration_rate || 'None' },
          ]} />
        </Section>

        <Section num={4} title="Storage Parameters">
          <InfoGrid items={[
            { label: 'Shelf Life', value: `${a.target_shelf_life || 30} days` },
            { label: 'Temperature', value: `${a.storage_temperature ?? '—'} °C` },
            { label: 'Humidity', value: `${a.storage_rh ?? '—'} % RH` },
            { label: 'Environment', value: a.storage_type || 'Ambient' },
            { label: 'Logistics', value: a.transport_condition || 'Standard Ambient' },
          ]} />
        </Section>

        <Section num={5} title="Sensitivities">
          <InfoGrid items={[
            { label: 'Oxygen', value: `${a.oxygen_sensitivity || 'Medium'} Sensitivity` },
            { label: 'Moisture', value: `${a.moisture_sensitivity || 'Medium'} Sensitivity` },
            { label: 'Light', value: `${a.light_sensitivity || 'Low'} Sensitivity` },
          ]} />
        </Section>

        <Section num={6} title="Packaging Requirements">
          <InfoGrid items={[
            { label: 'O₂ Barrier', value: pkg.critical_o2_barrier_needed || 'Standard' },
            { label: 'WVTR Barrier', value: pkg.critical_wvtr_barrier_needed || 'Standard' },
            { label: 'Mechanical', value: pkg.mechanical_protection_demand || 'Standard' },
            { label: 'Gas Exchange', value: pkg.gas_exchange_demand || 'Hermetic Seal' },
          ]} />
        </Section>

        <Section num={7} title="Preference Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--primary-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <span className="badge badge-green">Profile: {profileName}</span>
          </div>
        </Section>

        {/* Primary Recommendation */}
        <div style={{ marginBottom: '1.75rem', background: 'var(--primary-surface)', border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-green">8. PRIMARY RECOMMENDATION (#1 RANK)</span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', margin: '0.35rem 0 0.15rem 0' }}>{m.material_name || '—'}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.material_category} ({m.polymer_type}) • {m.thickness} μm</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Score</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{score}%</div>
            </div>
          </div>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.55, paddingLeft: '1.25rem' }}>
            {(primary.reasons || ['Complies with shelf-life target and barrier thresholds.']).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        <Section num={9} title="Compatibility Subscores">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
            {[
              { label: 'Oxygen', val: sub.oxygen },
              { label: 'Moisture', val: sub.moisture },
              { label: 'Shelf Life', val: sub.shelf_life },
              { label: 'Mechanical', val: sub.mechanical },
              { label: 'Sealability', val: sub.sealability },
              { label: 'Circularity', val: sub.sustainability },
              { label: 'Cost', val: sub.cost },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0.5rem', background: 'var(--primary-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem' }}>{s.label}</span>
                <strong style={{ color: 'var(--text-heading)', fontSize: '1rem' }}>{Math.round(s.val || 0)}%</strong>
              </div>
            ))}
          </div>
        </Section>

        <Section num={10} title="Cost Analysis">
          <InfoGrid items={[
            { label: 'Material Benchmark', value: `$${(cost.cost_per_sq_meter ?? m.estimated_cost ?? 0).toFixed(2)} / m²` },
            { label: 'Unit Cost', value: `$${(cost.unit_package_cost_usd ?? (m.estimated_cost || 0) * 0.05).toFixed(4)} / pouch` },
            { label: 'Cost Tier', value: `${cost.cost_tier || 'Moderate'} Tier` },
          ]} />
        </Section>

        <Section num={11} title="Sustainability">
          <InfoGrid items={[
            { label: 'Sustainability Index', value: `${parseFloat(sust.sustainability_index || 0).toFixed(1)} / 100` },
            { label: 'Recyclability', value: `${m.recyclability ?? '—'}%` },
            { label: 'Renewable', value: `${m.renewable_content ?? '0'}%` },
            { label: 'End-of-Life', value: sust.end_of_life_pathway || 'Municipal sorting' },
          ]} />
        </Section>

        <Section num={13} title="Domain Rules Triggered">
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
            {(primary.triggered_rules || []).length === 0
              ? <li>All criteria passed without restrictive penalties.</li>
              : (primary.triggered_rules || []).map((r, i) => <li key={i}><strong>[{r.rule_id}] {r.name}:</strong> {r.reason}</li>)
            }
          </ul>
        </Section>

        {/* Disclaimer */}
        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '0.92rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            17. Limitations & Testing Notice
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            This recommendation is produced by a hybrid expert-system and tabular ML pipeline running locally on CPU. ML models were trained on synthetic demonstration data. Laboratory barrier permeation testing (ASTM D3985 for OTR, ASTM F1249 for WVTR), accelerated shelf-life trials, and regulatory compliance are mandatory before commercial implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
