import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LoadingModal({ active, onComplete }) {
  const { t } = useLanguage();
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const running = useRef(false);

  const stepKeys = [
    'modal.step1',
    'modal.step2',
    'modal.step3',
    'modal.step4',
    'modal.step5',
    'modal.step6',
  ];

  useEffect(() => {
    if (!active || running.current) return;
    running.current = true;

    const runSteps = async () => {
      for (let i = 0; i < 6; i++) {
        setCurrentStepIdx(i);
        await new Promise(r => setTimeout(r, 150));
      }
      setCurrentStepIdx(6);
      if (onComplete) await onComplete();
      running.current = false;
    };

    setCurrentStepIdx(-1);
    runSteps();
  }, [active]);

  if (!active) return null;

  const icons = { pending: '○', active: '◐', done: '✓' };

  return (
    <div className={`modal-overlay${active ? ' active' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-card">
        <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🔬</div>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 700 }}>
          {t('modal.title', 'Analyzing Your Food...')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {t('modal.subtitle', 'Matching food properties with barrier requirements and domain safety rules.')}
        </p>
        <ul className="progress-steps-list">
          {stepKeys.map((key, idx) => {
            const status = currentStepIdx > idx ? 'done' : currentStepIdx === idx ? 'active' : 'pending';
            return (
              <li key={idx} className={`progress-step-item ${status}`}>
                <span style={status === 'done' ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}>
                  {icons[status]}
                </span>
                {t(key, '')}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

