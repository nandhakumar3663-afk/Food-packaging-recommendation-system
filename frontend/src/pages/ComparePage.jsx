import { useState, useEffect } from 'react';
import api from '../api/client';

const CATS = ['all', 'Flexible Film', 'Multi-layer Laminate', 'Bio-polymer', 'Paper & Paperboard', 'Glass'];

export default function ComparePage() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [showTech, setShowTech] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMaterials().then(r => { if (r?.success) setMaterials(r.materials || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m => {
    const matchCat = cat === 'all' || m.material_category === cat;
    const matchSearch = !search || m.material_name.toLowerCase().includes(search.toLowerCase()) || (m.polymer_type || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.size < 4 ? next.add(id) : null;
      return next;
    });
  };

  const selectedMats = materials.filter(m => selected.has(m.material_id));

  const barrierLabel = (otr, wvtr) => {
    if (otr <= 2 && wvtr <= 1) return '🛡️ Ultra-High';
    if (otr <= 10 && wvtr <= 5) return '🛡️ High';
    if (otr <= 100) return '⚡ Moderate';
    return '🔓 Low';
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Materials Catalog Matrix</span>
        <h1 className="page-title">Compare Packaging Materials</h1>
        <p className="page-subtitle">Explore and compare barrier properties, strength, recyclability, and cost across our database.</p>
      </div>

      {/* Filters */}
      <div className="card card-surface" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input type="text" className="form-control" placeholder="🔍 Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} type="button" className={`filter-pill${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                {c === 'all' ? 'All' : c === 'Paper & Paperboard' ? 'Paperboard' : c}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTech(p => !p)}>
            ⚙️ {showTech ? 'Hide' : 'Show'} Technical
          </button>
        </div>
      </div>

      {/* Selection Bar */}
      <div className="card card-surface" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-green">{selected.size} Selected</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Select 2–4 materials for side-by-side comparison.</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selected.size > 0 && <button className="btn btn-outline btn-sm" onClick={() => setSelected(new Set())}>Clear</button>}
          <button className="btn btn-primary btn-sm" disabled={selected.size < 2} onClick={() => setModalOpen(true)}>📊 Compare</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 45, textAlign: 'center' }}>✓</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Barrier</th>
                <th>Strength</th>
                <th>Sealability</th>
                <th>Sustainability</th>
                <th>Est. Cost</th>
                {showTech && <><th>OTR</th><th>WVTR</th><th>Thickness</th><th>Source</th></>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={showTech ? 12 : 8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading materials...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={showTech ? 12 : 8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No materials match your search.</td></tr>
              ) : filtered.map(m => (
                <tr key={m.material_id} style={{ cursor: 'pointer' }} onClick={() => toggleSelect(m.material_id)}>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(m.material_id)} onChange={() => toggleSelect(m.material_id)} />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{m.material_name}</td>
                  <td><span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{m.material_category}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{barrierLabel(m.otr, m.wvtr)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{m.tensile_strength ? `${m.tensile_strength} MPa` : '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{m.seal_temperature ? `${m.seal_temperature}°C` : '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{m.recyclability != null ? `${m.recyclability}%` : '—'}</td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>${(m.estimated_cost || 0).toFixed(2)}/m²</td>
                  {showTech && <>
                    <td style={{ fontSize: '0.78rem' }}>{m.otr}</td>
                    <td style={{ fontSize: '0.78rem' }}>{m.wvtr}</td>
                    <td style={{ fontSize: '0.78rem' }}>{m.thickness} μm</td>
                    <td style={{ fontSize: '0.72rem' }}>{m.source || '—'}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, overflowY: 'auto', padding: '2rem 1rem' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: 'var(--bg-surface)', maxWidth: 950, margin: '0 auto', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', border: '1px solid var(--border-default)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: 'var(--primary-surface)', padding: '1.25rem 1.5rem', borderBottom: '2px solid var(--border-accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '0.25rem' }}>Direct Specification Comparison</span>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>Side-by-Side Evaluation</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    {selectedMats.map(m => <th key={m.material_id}>{m.material_name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Category', fn: m => m.material_category },
                    { label: 'OTR (cc/m²/day)', fn: m => m.otr },
                    { label: 'WVTR (g/m²/day)', fn: m => m.wvtr },
                    { label: 'Thickness (μm)', fn: m => m.thickness },
                    { label: 'Tensile (MPa)', fn: m => m.tensile_strength || '—' },
                    { label: 'Seal Temp (°C)', fn: m => m.seal_temperature || '—' },
                    { label: 'Recyclability', fn: m => m.recyclability != null ? `${m.recyclability}%` : '—' },
                    { label: 'Renewable', fn: m => m.renewable_content != null ? `${m.renewable_content}%` : '—' },
                    { label: 'Cost ($/m²)', fn: m => `$${(m.estimated_cost || 0).toFixed(2)}` },
                    { label: 'Source', fn: m => m.source || '—' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      {selectedMats.map(m => <td key={m.material_id}>{row.fn(m)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: 'var(--primary-surface)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Unit cost assumes 0.05 m² snack/produce pouch.</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
