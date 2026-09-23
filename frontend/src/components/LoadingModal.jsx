import { useState, useEffect, useRef } from 'react';

export default function LoadingModal({ active, onComplete }) {
  const [steps, setSteps] = useState([
    { id: 1, text: 'Checking food characteristics', status: 'pending' },
    { id: 2, text: 'Checking storage requirements', status: 'pending' },
    { id: 3, text: 'Filtering unsuitable materials with safety rules', status: 'pending' },
    { id: 4, text: 'Machine-learning candidate assessment', status: 'pending' },
    { id: 5, text: 'Evaluating packaging compatibility', status: 'pending' },
    { id: 6, text: 'Preparing your recommendation', status: 'pending' },
  ]);
  const running = useRef(false);

  useEffect(() => {
    if (!active || running.current) return;
    running.current = true;

    const runSteps = async () => {
      for (let i = 0; i < 6; i++) {
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'active' } : s));
        await new Promise(r => setTimeout(r, 150));
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
      }
      if (onComplete) await onComplete();
      running.current = false;
    };

    // Reset all steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    runSteps();
  }, [active]);

  if (!active) return null;

  const icons = { pending: '○', active: '◐', done: '✓' };

  return (
    <div className={`modal-overlay${active ? ' active' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-card">
        <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🔬</div>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 700 }}>
          Analyzing Your Food...
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Matching food properties with barrier requirements and domain safety rules.
        </p>
        <ul className="progress-steps-list">
          {steps.map(s => (
            <li key={s.id} className={`progress-step-item ${s.status}`}>
              <span style={s.status === 'done' ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}>
                {icons[s.status]}
              </span>
              {s.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
