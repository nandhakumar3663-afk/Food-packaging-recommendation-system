import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function MonitorPage() {
  const { t } = useLanguage();
  const [latest, setLatest] = useState(null);
  const [assessment, setAssessment] = useState({});
  const [histories, setHistories] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [chartPoints, setChartPoints] = useState([]);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.getIoTLatest(null, selectedAnalysis || null);
      if (res?.success) {
        setLatest(res.reading);
        setAssessment(res.assessment || {});
        setOffline(!res.reading);
        if (res.reading) {
          setChartPoints(prev => {
            const next = [...prev, { t: Date.now(), temp: res.reading.temperature, hum: res.reading.humidity }];
            return next.slice(-60);
          });
        }
      }
    } catch { setOffline(true); }

    try {
      const rRes = await api.getIoTReadings({ limit: 50, analysis_id: selectedAnalysis || undefined });
      if (rRes?.success) setHistories(rRes.readings || []);
    } catch {}
  }, [selectedAnalysis]);

  useEffect(() => {
    api.getHistory(20).then(r => { if (r?.success) setAnalyses(r.history || []); }).catch(() => {});
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const linkedAnalysis = selectedAnalysis ? analyses.find(a => a.recommendation_id === parseInt(selectedAnalysis)) : null;

  const status = assessment.status || 'NORMAL';
  const statusColor = status === 'WARNING' ? 'var(--error)' : status === 'WATCH' ? 'var(--warning)' : 'var(--primary)';
  const statusIcon = status === 'WARNING' ? '🔴' : status === 'WATCH' ? '🟡' : '🟢';

  // SVG Chart
  const renderChart = () => {
    if (chartPoints.length < 2) return null;
    const w = 800, h = 180, pad = 30;
    const temps = chartPoints.map(p => p.temp).filter(Boolean);
    const hums = chartPoints.map(p => p.hum).filter(Boolean);
    if (temps.length < 2) return null;
    const tMin = Math.min(...temps) - 2, tMax = Math.max(...temps) + 2;
    const hMin = Math.min(...hums) - 5, hMax = Math.max(...hums) + 5;
    const xScale = (i) => pad + (i / (chartPoints.length - 1)) * (w - 2 * pad);
    const yTemp = (v) => h - pad - ((v - tMin) / (tMax - tMin || 1)) * (h - 2 * pad);
    const yHum = (v) => h - pad - ((v - hMin) / (hMax - hMin || 1)) * (h - 2 * pad);
    const tempPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yTemp(p.temp || 0)}`).join(' ');
    const humPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yHum(p.hum || 0)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
        <path d={tempPath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={humPath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />
      </svg>
    );
  };

  return (
    <div className="page-enter" style={{ maxWidth: 950, margin: '0 auto' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">{t('monitor.badge', 'Live Storage Telemetry')}</span>
              <span className="badge badge-neutral">Device: ESP32</span>
              <span className="badge badge-info">Sensor Observation</span>
            </div>
            <h1 className="page-title">{t('monitor.pageTitle', 'Storage Condition Monitor')}</h1>
            <p className="page-subtitle">{t('monitor.pageSubtitle', 'Real-time environmental monitoring against packaging analysis assumptions.')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label htmlFor="select-analysis" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('monitor.linkToAnalysis', 'Link Analysis')}:</label>
              <select id="select-analysis" className="form-control" style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', minWidth: 170 }}
                value={selectedAnalysis} onChange={e => setSelectedAnalysis(e.target.value)}>
                <option value="">{t('monitor.allAnalyses', '-- All / General --')}</option>
                {analyses.map(a => <option key={a.recommendation_id} value={a.recommendation_id}>#{a.recommendation_id} — {a.food_name}</option>)}
              </select>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>🔄 Refresh</button>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--primary-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="live-pulse" />
          <span>Live Telemetry Active • Polling every 5s</span>
        </div>
        <div>{latest ? `Last: ${latest.timestamp || 'just now'}` : 'Checking connection...'}</div>
      </div>

      {/* Offline Alert */}
      {offline && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem' }}>⚠️</div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.92rem' }}>NO RECENT SENSOR DATA</strong>
            <span style={{ fontSize: '0.82rem' }}>{t('monitor.offlineNotice', 'The IoT microcontroller has not transmitted within the last 60 seconds.')}</span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Temperature */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('monitor.tempGauge', 'Temperature')}</span>
            <span style={{ fontSize: '1.2rem' }}>🌡️</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>{latest?.temperature ?? '--'}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {linkedAnalysis?.storage_temperature ?? '--'}°C</div>
        </div>

        {/* Humidity */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('monitor.humGauge', 'Humidity')}</span>
            <span style={{ fontSize: '1.2rem' }}>💧</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0369a1' }}>{latest?.humidity ?? '--'}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>% RH</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {linkedAnalysis?.storage_rh ?? '--'}% RH</div>
        </div>

        {/* CO2 */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('monitor.co2Gauge', 'Carbon Dioxide')}</span>
            <span style={{ fontSize: '1.2rem' }}>💨</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6d28d9', marginBottom: '0.25rem' }}>
            {latest?.co2 != null ? `${latest.co2} ppm` : 'Unavailable'}
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{latest?.co2 != null ? 'Active' : 'Not Installed'}</span>
        </div>

        {/* Condition State */}
        <div className="card" style={{ padding: '1.25rem', borderTop: `4px solid ${statusColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('monitor.liveStatus', 'Condition')}</span>
            <span style={{ fontSize: '1.2rem' }}>{statusIcon}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColor, marginBottom: '0.25rem' }}>{status}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            {assessment.reason || 'Conditions align with packaging assumptions.'}
          </div>
        </div>
      </div>


      {/* Baseline Comparison */}
      <div className="card card-accent" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.35rem' }}>
              {linkedAnalysis ? `Linked to Analysis #${linkedAnalysis.recommendation_id}` : 'General Monitor'}
            </span>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: '0 0 0.25rem 0' }}>
              {linkedAnalysis ? linkedAnalysis.food_name : 'Packaging Baseline Comparison'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Comparing live telemetry with initial packaging design parameters.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchData}>🔄 Reassess</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
          {[
            { label: 'Food Commodity', val: linkedAnalysis?.food_name || '—' },
            { label: 'Target Condition', val: linkedAnalysis ? `${linkedAnalysis.storage_temperature ?? '--'}°C / ${linkedAnalysis.storage_rh ?? '--'}% RH` : '—' },
            { label: 'Observed', val: latest ? `${latest.temperature}°C / ${latest.humidity}% RH` : '—' },
            { label: 'Recommended Packaging', val: linkedAnalysis?.material_name || '—' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
              <strong style={{ color: 'var(--text-heading)' }}>{item.val}</strong>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', borderLeft: `4px solid ${statusColor}` }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{statusIcon}</span>
            <div style={{ fontSize: '0.82rem' }}>
              <strong style={{ color: 'var(--text-heading)', display: 'block' }}>Condition Advisory</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {assessment.action_advisory || assessment.reason || 'Evaluating storage stability...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>📈 Recent Telemetry Trends</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0' }}>Temperature and humidity over recent readings.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 3, background: '#059669' }} /> Temperature
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 3, background: '#0ea5e9' }} /> Humidity
            </span>
          </div>
        </div>
        <div style={{ width: '100%', height: 200, background: 'var(--primary-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
          {chartPoints.length >= 2 ? renderChart() : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Collecting telemetry points for trend chart...
            </div>
          )}
        </div>
      </div>

      {/* Device Accordion */}
      <div className={`accordion${deviceOpen ? ' open' : ''}`} style={{ marginBottom: '2.5rem' }}>
        <button type="button" className="accordion-header" onClick={() => setDeviceOpen(p => !p)}>
          <span>⚙️ Microcontroller & Telemetry Provenance</span>
          <span className="accordion-icon">{deviceOpen ? '▲' : '▼'}</span>
        </button>
        <div className="accordion-content" style={deviceOpen ? { maxHeight: 600, padding: '1.25rem' } : {}}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Device</span><strong>{latest?.device_id || 'ESP32'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Hardware</span><span>ESP32 DevKit v1</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Provenance</span><span>{latest?.source || 'SENSOR OBSERVATION'}</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Signal</span><span>{latest?.rssi ? `${latest.rssi} dBm` : '-- dBm'}</span></div>
          </div>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>Latest Payload (JSON):</h4>
          <pre style={{ background: 'var(--primary-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', overflow: 'auto', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {latest ? JSON.stringify(latest, null, 2) : 'Waiting for packet...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
