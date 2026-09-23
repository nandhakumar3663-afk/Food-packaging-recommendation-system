import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Layout';
import LoadingModal from '../components/LoadingModal';

const CATEGORIES = [
  { value: '', label: '-- Select Category --' },
  { value: 'Produce', label: 'Fresh Produce (Fruits & Vegetables)' },
  { value: 'Snack Foods', label: 'Snack Foods & Crisps' },
  { value: 'Meat & Poultry', label: 'Meat & Poultry' },
  { value: 'Dairy', label: 'Dairy & Cheese' },
  { value: 'Bakery', label: 'Bakery & Bread' },
  { value: 'Dry Goods & Cereals', label: 'Dry Goods & Cereals' },
  { value: 'Beverages', label: 'Beverages & Juices' },
  { value: 'Confectionery', label: 'Confectionery & Sweets' },
  { value: 'Condiments & Sauces', label: 'Condiments & Sauces' },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [presets, setPresets] = useState([]);
  const [presetId, setPresetId] = useState('');
  const [presetLoaded, setPresetLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    food_name: '', category: '', moisture: 50, fat: 5, ph: 6.0,
    respiration_rate: 'None', target_shelf_life: 30, storage_temperature: 20,
    storage_rh: 60, storage_type: 'Ambient', transport_condition: 'Standard Ambient',
    oxygen_sensitivity: 'Medium', moisture_sensitivity: 'Medium', light_sensitivity: 'Low',
    preference_profile: 'balanced',
  });

  useEffect(() => {
    api.getPresets().then(r => { if (r?.success) setPresets(r.presets); }).catch(() => {});
  }, []);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const applyPreset = () => {
    const preset = presets.find(p => p.food_id === parseInt(presetId, 10));
    if (!preset) return;
    setForm(prev => ({
      ...prev,
      food_name: preset.food_name || '',
      category: preset.category || '',
      moisture: preset.moisture ?? 50,
      fat: preset.fat ?? 5,
      ph: preset.ph ?? 6.0,
      respiration_rate: preset.respiration_rate || 'None',
      target_shelf_life: preset.target_shelf_life || 30,
      storage_temperature: preset.storage_temperature ?? 20,
      storage_rh: preset.storage_rh ?? 60,
      oxygen_sensitivity: preset.oxygen_sensitivity || 'Medium',
      moisture_sensitivity: preset.moisture_sensitivity || 'Medium',
      light_sensitivity: preset.light_sensitivity || 'Low',
    }));
    setPresetLoaded(true);
    showToast(`Loaded preset for ${preset.food_name}`, 'info');
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.food_name.trim()) e.food_name = 'Please enter a food name.';
      if (!form.category) e.category = 'Please select a food category.';
    } else if (s === 2) {
      const m = parseFloat(form.moisture), f = parseFloat(form.fat), p = parseFloat(form.ph);
      if (isNaN(m) || m < 0 || m > 100) e.moisture = 'Moisture must be between 0 and 100%.';
      if (isNaN(f) || f < 0 || f > 100) e.fat = 'Fat must be between 0 and 100%.';
      if (!isNaN(m) && !isNaN(f) && m + f > 100) { e.moisture = 'Sum cannot exceed 100%.'; e.fat = 'Sum cannot exceed 100%.'; }
      if (isNaN(p) || p < 1 || p > 14) e.ph = 'pH must be between 1.0 and 14.0.';
    } else if (s === 3) {
      const sl = parseInt(form.target_shelf_life, 10), t = parseFloat(form.storage_temperature), rh = parseFloat(form.storage_rh);
      if (isNaN(sl) || sl <= 0) e.target_shelf_life = 'Must be at least 1 day.';
      if (isNaN(t) || t < -30 || t > 60) e.storage_temperature = 'Must be -30°C to 60°C.';
      if (isNaN(rh) || rh < 10 || rh > 100) e.storage_rh = 'Must be 10% to 100%.';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) showToast('Some fields need correction.', 'warning');
    return Object.keys(e).length === 0;
  };

  const goNext = (next) => { if (validate(step)) { setStep(next); window.scrollTo({ top: 120, behavior: 'smooth' }); } };
  const goBack = (prev) => { setStep(prev); window.scrollTo({ top: 120, behavior: 'smooth' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let s = 1; s <= 4; s++) { if (!validate(s)) { setStep(s); return; } }
    setLoading(true);
  };

  const handleAnalysisComplete = async () => {
    try {
      const payload = {
        ...form,
        moisture: parseFloat(form.moisture),
        fat: parseFloat(form.fat),
        ph: parseFloat(form.ph),
        target_shelf_life: parseInt(form.target_shelf_life, 10),
        storage_temperature: parseFloat(form.storage_temperature),
        storage_rh: parseFloat(form.storage_rh),
      };
      const response = await api.analyzePackaging(payload);
      if (response?.success) {
        sessionStorage.setItem('last_packaging_result', JSON.stringify(response));
        navigate('/results');
      } else {
        const errList = response?.errors?.join('; ') || 'Invalid submission.';
        showToast(`Analysis error: ${errList}`, 'error');
      }
    } catch (err) {
      showToast("Couldn't complete analysis. Check connection and try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, tooltip, hint, children }) => (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={id} className="form-label">{label}</label>
        {tooltip && <button type="button" className="tooltip-btn" onClick={() => showToast(tooltip, 'info')}>ℹ️</button>}
      </div>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
      {errors[id] && <span className="field-error" style={{ display: 'block' }}>{errors[id]}</span>}
    </div>
  );

  const NumericInput = ({ id, value, min, max, step: s, unit, ...rest }) => (
    <div className="input-container">
      <input type="number" id={id} className={`form-control input-has-unit${errors[id] ? ' input-error' : ''}`}
        value={value} min={min} max={max} step={s} onChange={e => set(id, e.target.value)} {...rest} />
      <span className="input-unit">{unit}</span>
    </div>
  );

  const stepIndicators = [
    { n: 1, label: 'Food Item' }, { n: 2, label: 'Properties' },
    { n: 3, label: 'Storage' }, { n: 4, label: 'Sensitivities' },
  ];

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
      <LoadingModal active={loading} onComplete={handleAnalysisComplete} />

      {/* Header */}
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Step-by-Step Assistant</span>
        <h1 className="page-title">Food Packaging Analysis</h1>
        <p className="page-subtitle" style={{ margin: '0 auto' }}>
          Answer a few questions about your food product to receive an optimal, explainable packaging recommendation.
        </p>
      </div>

      {/* Step Wizard */}
      <div className="step-wizard" aria-label="Analysis Steps">
        {stepIndicators.map((s, i) => (
          <div key={s.n} className={`step-item${step === s.n ? ' active' : step > s.n ? ' completed' : ''}`}>
            <div className="step-circle">{step > s.n ? '✓' : s.n}</div>
            <span className="step-title">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card card-accent">
        <form onSubmit={handleSubmit} noValidate>

          {/* STEP 1 */}
          <div className={`form-step${step === 1 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">Step 1: What are you packaging?</h2>
                <p className="form-hint">Choose a standard food commodity or enter your own custom food.</p>
              </div>
              <span className="badge badge-neutral">1 of 4</span>
            </div>

            {/* Preset */}
            <div style={{ background: 'var(--primary-surface)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <label htmlFor="preset-select" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚡ Quick-Start: Load a Known Food Preset
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <select id="preset-select" className="form-control" style={{ flex: 1, minWidth: 240 }}
                  value={presetId} onChange={e => { setPresetId(e.target.value); }}>
                  <option value="">-- Choose a standard food commodity --</option>
                  {presets.map(p => <option key={p.food_id} value={p.food_id}>{p.food_name} ({p.category})</option>)}
                </select>
                <button type="button" className="btn btn-secondary btn-sm" onClick={applyPreset}>Load Preset</button>
              </div>
              {presetLoaded && <div className="badge badge-green" style={{ marginTop: '0.65rem' }}>✓ Preset loaded — edit values below</div>}
            </div>

            <div className="form-grid">
              <Field id="food_name" label="Food Name *" hint="Common or commercial food item name">
                <input type="text" id="food_name" className={`form-control${errors.food_name ? ' input-error' : ''}`}
                  placeholder="e.g. Crisp Potato Chips" value={form.food_name} onChange={e => set('food_name', e.target.value)} />
              </Field>
              <Field id="category" label="Food Category *" hint="Used for default risk evaluation">
                <select id="category" className={`form-control${errors.category ? ' input-error' : ''}`}
                  value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => goNext(2)}>Next: Food Properties →</button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`form-step${step === 2 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">Step 2: Food Characteristics</h2>
                <p className="form-hint">Physical composition determines moisture barriers, fat oxidation risks, and acidity constraints.</p>
              </div>
              <span className="badge badge-neutral">2 of 4</span>
            </div>
            <div className="form-grid">
              <Field id="moisture" label="Moisture Content" hint="Water percentage (0 to 100%)"
                tooltip="How much water the food contains. High moisture foods need vapor retention, while dry snacks need strict moisture exclusion.">
                <NumericInput id="moisture" value={form.moisture} min={0} max={100} step={0.1} unit="%" />
              </Field>
              <Field id="fat" label="Fat & Oil Content" hint="Lipid percentage (Moisture + Fat ≤ 100%)"
                tooltip="Higher fat content increases susceptibility to rancidity from light and oxygen exposure.">
                <NumericInput id="fat" value={form.fat} min={0} max={100} step={0.1} unit="%" />
              </Field>
              <Field id="ph" label="Acidity Level (pH)" hint="1 (very acidic) to 14 (alkaline)"
                tooltip="Acidic foods (pH < 4.5) restrict bare unlined metal packaging to prevent corrosion.">
                <NumericInput id="ph" value={form.ph} min={1} max={14} step={0.1} unit="pH" />
              </Field>
              <Field id="respiration_rate" label="Respiration Activity" hint="How actively the fresh food breathes after harvest"
                tooltip="Fresh produce continues to consume oxygen and release CO2. Higher respiration requires permeable packaging.">
                <select id="respiration_rate" className="form-control" value={form.respiration_rate} onChange={e => set('respiration_rate', e.target.value)}>
                  <option value="None">None (Processed, dry, cooked)</option>
                  <option value="Low">Low (Apples, citrus, potatoes)</option>
                  <option value="Moderate">Moderate (Tomatoes, carrots)</option>
                  <option value="High">High (Strawberries, bananas)</option>
                  <option value="Very High">Very High (Spinach, mushrooms)</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(1)}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={() => goNext(3)}>Next: Storage & Shelf Life →</button>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={`form-step${step === 3 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">Step 3: Storage & Shelf Life</h2>
                <p className="form-hint">Define temperature, relative humidity, and how long the product must remain fresh.</p>
              </div>
              <span className="badge badge-neutral">3 of 4</span>
            </div>
            <div className="form-grid">
              <Field id="target_shelf_life" label="Desired Shelf Life *" hint="Expected duration in distribution"
                tooltip="How long the food product should stay fresh and safe under specified storage.">
                <NumericInput id="target_shelf_life" value={form.target_shelf_life} min={1} max={1000} step={1} unit="days" />
              </Field>
              <Field id="storage_temperature" label="Storage Temperature" hint="Temperature during storage and retail"
                tooltip="Ambient is typically 20-25°C, refrigerated is 2-4°C, frozen is -18°C.">
                <NumericInput id="storage_temperature" value={form.storage_temperature} min={-30} max={60} step={0.5} unit="°C" />
              </Field>
              <Field id="storage_rh" label="Relative Humidity" hint="Humidity surrounding the packaged product"
                tooltip="High ambient humidity accelerates moisture ingress for dry items.">
                <NumericInput id="storage_rh" value={form.storage_rh} min={10} max={100} step={1} unit="%" />
              </Field>
              <Field id="storage_type" label="Storage Environment" hint="Primary warehousing condition">
                <select id="storage_type" className="form-control" value={form.storage_type} onChange={e => set('storage_type', e.target.value)}>
                  <option value="Ambient">Ambient Room Temperature</option>
                  <option value="Refrigerated">Refrigerated / Chilled (2–4°C)</option>
                  <option value="Frozen">Frozen (-18°C)</option>
                  <option value="Controlled Atmosphere">Controlled Atmosphere (CA/MAP)</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(2)}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={() => goNext(4)}>Next: Sensitivities →</button>
            </div>
          </div>

          {/* STEP 4 */}
          <div className={`form-step${step === 4 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">Step 4: Sensitivities & Preferences</h2>
                <p className="form-hint">Specify environmental degradation vulnerabilities and scoring priorities.</p>
              </div>
              <span className="badge badge-neutral">4 of 4</span>
            </div>
            <div className="form-grid">
              <Field id="oxygen_sensitivity" label="Oxygen Sensitivity" hint="Drives Oxygen Barrier (OTR) requirements"
                tooltip="High sensitivity demands an excellent gas barrier film.">
                <select id="oxygen_sensitivity" className="form-control" value={form.oxygen_sensitivity} onChange={e => set('oxygen_sensitivity', e.target.value)}>
                  <option value="Low">Low — Tolerant to air exposure</option>
                  <option value="Medium">Medium — Moderate oxidation risk</option>
                  <option value="High">High — Prone to rapid oxidation</option>
                </select>
              </Field>
              <Field id="moisture_sensitivity" label="Moisture Sensitivity" hint="Drives Water Vapor Barrier (WVTR) requirements"
                tooltip="High sensitivity protects against soggy snacks or dry-out.">
                <select id="moisture_sensitivity" className="form-control" value={form.moisture_sensitivity} onChange={e => set('moisture_sensitivity', e.target.value)}>
                  <option value="Low">Low — Moisture changes have low impact</option>
                  <option value="Medium">Medium — Standard protection needed</option>
                  <option value="High">High — Very susceptible to humidity</option>
                </select>
              </Field>
              <Field id="light_sensitivity" label="Light Sensitivity" hint="Protection from photo-oxidation"
                tooltip="Photo-oxidation degrades fats, vitamins, and colors. High sensitivity requires opaque barriers.">
                <select id="light_sensitivity" className="form-control" value={form.light_sensitivity} onChange={e => set('light_sensitivity', e.target.value)}>
                  <option value="Low">Low — Transparent packaging suitable</option>
                  <option value="Medium">Medium — Moderate light protection</option>
                  <option value="High">High — Requires UV / light-blocking film</option>
                </select>
              </Field>
              <Field id="transport_condition" label="Logistics & Handling" hint="Physical distribution mode">
                <select id="transport_condition" className="form-control" value={form.transport_condition} onChange={e => set('transport_condition', e.target.value)}>
                  <option value="Standard Ambient">Standard Ambient Logistics</option>
                  <option value="Cold Chain">Cold Chain Refrigerated</option>
                  <option value="Ventilated">Ventilated Fresh Logistics</option>
                  <option value="Frozen Logistics">Frozen Logistics</option>
                </select>
              </Field>
            </div>

            {/* Preference Profile */}
            <div style={{ marginTop: '1.75rem', background: 'var(--primary-surface)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                🎯 Decision Preference Profile
              </label>
              <p className="form-hint" style={{ marginBottom: '1rem' }}>Select how the recommendation engine should weigh competing priorities:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { value: 'balanced', icon: '⚖️', title: 'Balanced Performance (Recommended)', desc: 'Evenly evaluates gas barrier, shelf life, seal integrity, mechanical strength, cost, and recyclability.' },
                  { value: 'cost_priority', icon: '💰', title: 'Cost Priority Profile', desc: 'Weights affordability heavily (30%) while preserving mandatory oxygen and moisture safety barriers.' },
                  { value: 'sustainability_priority', icon: '🌿', title: 'Sustainability Priority Profile', desc: 'Weights recyclability and renewable content heavily (30%) while enforcing barrier protection.' },
                ].map(p => (
                  <label key={p.value} className={`radio-card${form.preference_profile === p.value ? ' selected' : ''}`}
                    onClick={() => set('preference_profile', p.value)}>
                    <input type="radio" name="preference_profile" value={p.value}
                      checked={form.preference_profile === p.value} onChange={() => set('preference_profile', p.value)}
                      style={{ marginTop: '0.25rem' }} />
                    <div>
                      <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.92rem' }}>{p.icon} {p.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(3)}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                🚀 Analyze Packaging
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
