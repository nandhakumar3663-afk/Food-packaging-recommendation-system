import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory(50).then(r => { if (r?.success) setHistory(r.history || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = history.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (search.startsWith('#')) {
      const id = search.slice(1);
      return String(h.recommendation_id).includes(id);
    }
    return (h.food_name || '').toLowerCase().includes(q) || (h.material_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="page-enter" style={{ maxWidth: 920, margin: '0 auto' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Audit & Prior Runs</span>
          <h1 className="page-title">Recommendation History</h1>
          <p className="page-subtitle">Review past packaging analysis runs, profiles, and compatibility scores.</p>
        </div>
        <Link to="/analyze" className="btn btn-primary btn-sm">➕ New Analysis</Link>
      </div>

      {/* Search */}
      <div className="card card-surface" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input type="text" className="form-control" placeholder="🔍 Search by food name or #ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {history.length} records
          </span>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading previous analyses...</div>
      ) : filtered.length === 0 ? (
        <div className="card card-surface" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
            {history.length === 0 ? 'No analyses yet' : 'No matching results'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            {history.length === 0
              ? 'Your completed food packaging recommendations will appear here.'
              : 'Try a different search term or clear the filter.'}
          </p>
          {history.length === 0 && <Link to="/analyze" className="btn btn-primary">🚀 Start Your First Analysis</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(h => (
            <div key={h.recommendation_id} className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>#{h.recommendation_id}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.created_at || '—'}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.2rem' }}>{h.food_name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Recommended: <strong style={{ color: 'var(--primary)' }}>{h.material_name}</strong> • {h.category}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {parseFloat(h.compatibility_score || 0).toFixed(1)}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compatibility</span>
                </div>
                <Link to={`/report?id=${h.recommendation_id}`} className="btn btn-outline btn-sm">View Report</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
