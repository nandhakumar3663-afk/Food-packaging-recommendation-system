import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import LoadingModal from '../components/LoadingModal';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { t } = useLanguage();
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

  const categories = [
    { value: '', label: t('analyze.selectCategory', '-- Select Category --') },
    { value: 'Produce', label: t('analyze.categories.produce', 'Fresh Produce (Fruits & Vegetables)') },
    { value: 'Snack Foods', label: t('analyze.categories.snack', 'Snack Foods & Crisps') },
    { value: 'Meat & Poultry', label: t('analyze.categories.meat', 'Meat & Poultry') },
    { value: 'Dairy', label: t('analyze.categories.dairy', 'Dairy & Cheese') },
    { value: 'Bakery', label: t('analyze.categories.bakery', 'Bakery & Bread') },
    { value: 'Dry Goods & Cereals', label: t('analyze.categories.dryGoods', 'Dry Goods & Cereals') },
    { value: 'Beverages', label: t('analyze.categories.beverages', 'Beverages & Juices') },
    { value: 'Confectionery', label: t('analyze.categories.confectionery', 'Confectionery & Sweets') },
    { value: 'Condiments & Sauces', label: t('analyze.categories.condiments', 'Condiments & Sauces') },
  ];

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
    showToast(`${preset.food_name}`, 'info');
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.food_name.trim()) e.food_name = t('analyze.validation.foodNameReq', 'Please enter a food name.');
      if (!form.category) e.category = t('analyze.validation.categoryReq', 'Please select a food category.');
    } else if (s === 2) {
      const m = parseFloat(form.moisture), f = parseFloat(form.fat), p = parseFloat(form.ph);
      if (isNaN(m) || m < 0 || m > 100) e.moisture = t('analyze.validation.moistureRange', 'Moisture must be between 0 and 100%.');
      if (isNaN(f) || f < 0 || f > 100) e.fat = t('analyze.validation.fatRange', 'Fat must be between 0 and 100%.');
      if (!isNaN(m) && !isNaN(f) && m + f > 100) { 
        e.moisture = t('analyze.validation.sumLimit', 'Sum of moisture and fat cannot exceed 100%.'); 
        e.fat = t('analyze.validation.sumLimit', 'Sum of moisture and fat cannot exceed 100%.'); 
      }
      if (isNaN(p) || p < 1 || p > 14) e.ph = t('analyze.validation.phRange', 'pH must be between 1.0 and 14.0.');
    } else if (s === 3) {
      const sl = parseInt(form.target_shelf_life, 10), temp = parseFloat(form.storage_temperature), rh = parseFloat(form.storage_rh);
      if (isNaN(sl) || sl <= 0) e.target_shelf_life = t('analyze.validation.shelfLifeMin', 'Target shelf life must be at least 1 day.');
      if (isNaN(temp) || temp < -30 || temp > 60) e.storage_temperature = t('analyze.validation.tempRange', 'Temperature must be between -30°C and 60°C.');
      if (isNaN(rh) || rh < 10 || rh > 100) e.storage_rh = t('analyze.validation.rhRange', 'Relative humidity must be between 10% and 100%.');
    }
    setErrors(e);
    if (Object.keys(e).length > 0) showToast(t('analyze.validation.fixErrors', 'Some fields need correction.'), 'warning');
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
    { n: 1, label: t('analyze.step1', '1. Food Details') }, 
    { n: 2, label: t('analyze.step2', '2. Properties & Respiration') },
    { n: 3, label: t('analyze.step3', '3. Storage & Logistics') }, 
    { n: 4, label: t('analyze.step4', '4. Goals & Sensitivities') },
  ];

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
      <LoadingModal active={loading} onComplete={handleAnalysisComplete} />

      {/* Header */}
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>{t('analyze.badge', 'Decision Intelligence Pipeline')}</span>
        <h1 className="page-title">{t('analyze.pageTitle', 'Food Packaging Analysis')}</h1>
        <p className="page-subtitle" style={{ margin: '0 auto' }}>
          {t('analyze.pageSubtitle', 'Enter food properties, storage conditions, and optimization goals to evaluate optimal packaging materials.')}
        </p>
      </div>

      {/* Step Wizard */}
      <div className="step-wizard" aria-label="Analysis Steps">
        {stepIndicators.map((s) => (
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
                <h2 className="card-title">{t('analyze.step1Title', 'Food Identification & Presets')}</h2>
                <p className="form-hint">{t('analyze.step1Desc', 'Choose a standard food commodity or enter your own custom food.')}</p>
              </div>
              <span className="badge badge-neutral">1 / 4</span>
            </div>

            {/* Preset */}
            <div style={{ background: 'var(--primary-surface)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <label htmlFor="preset-select" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚡ {t('analyze.presetLabel', 'Quick-load a Preset Food')}
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <select id="preset-select" className="form-control" style={{ flex: 1, minWidth: 240 }}
                  value={presetId} onChange={e => { setPresetId(e.target.value); }}>
                  <option value="">{t('analyze.selectPreset', '-- Select a pre-configured food item --')}</option>
                  {presets.map(p => <option key={p.food_id} value={p.food_id}>{p.food_name} ({p.category})</option>)}
                </select>
                <button type="button" className="btn btn-secondary btn-sm" onClick={applyPreset}>
                  {t('analyze.loadPresetBtn', 'Apply Preset')}
                </button>
              </div>
              {presetLoaded && <div className="badge badge-green" style={{ marginTop: '0.65rem' }}>✓ Preset loaded</div>}
            </div>

            <div className="form-grid">
              <Field id="food_name" label={`${t('analyze.foodNameLabel', 'Food Name')} *`} hint={t('analyze.foodNamePlaceholder', 'e.g. Crisp Potato Chips')}>
                <input type="text" id="food_name" className={`form-control${errors.food_name ? ' input-error' : ''}`}
                  placeholder={t('analyze.foodNamePlaceholder', 'e.g. Crisp Potato Chips')} value={form.food_name} onChange={e => set('food_name', e.target.value)} />
              </Field>
              <Field id="category" label={`${t('analyze.categoryLabel', 'Food Category')} *`}>
                <select id="category" className={`form-control${errors.category ? ' input-error' : ''}`}
                  value={form.category} onChange={e => set('category', e.target.value)}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => goNext(2)}>
                {t('analyze.nextBtn', 'Next Step →')}
              </button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`form-step${step === 2 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">{t('analyze.step2Title', 'Physicochemical Properties')}</h2>
                <p className="form-hint">{t('analyze.step2Desc', 'Physical composition determines moisture barriers, fat oxidation risks, and acidity constraints.')}</p>
              </div>
              <span className="badge badge-neutral">2 / 4</span>
            </div>
            <div className="form-grid">
              <Field id="moisture" label={t('analyze.moistureLabel', 'Moisture Content (%)')}>
                <NumericInput id="moisture" value={form.moisture} min={0} max={100} step={0.1} unit="%" />
              </Field>
              <Field id="fat" label={t('analyze.fatLabel', 'Fat Content (%)')}>
                <NumericInput id="fat" value={form.fat} min={0} max={100} step={0.1} unit="%" />
              </Field>
              <Field id="ph" label={t('analyze.phLabel', 'Acidity (pH Level)')}>
                <NumericInput id="ph" value={form.ph} min={1} max={14} step={0.1} unit="pH" />
              </Field>
              <Field id="respiration_rate" label={t('analyze.respirationLabel', 'Respiration Rate')}>
                <select id="respiration_rate" className="form-control" value={form.respiration_rate} onChange={e => set('respiration_rate', e.target.value)}>
                  <option value="None">{t('analyze.respirationRates.none', 'None / Inert (Non-respiring)')}</option>
                  <option value="Low">{t('analyze.respirationRates.low', 'Low (e.g. Onions, Potatoes)')}</option>
                  <option value="Moderate">{t('analyze.respirationRates.medium', 'Medium (e.g. Apples, Carrots)')}</option>
                  <option value="High">{t('analyze.respirationRates.high', 'High (e.g. Strawberries, Bananas)')}</option>
                  <option value="Very High">{t('analyze.respirationRates.veryHigh', 'Very High / Extreme (e.g. Mushrooms, Asparagus)')}</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(1)}>
                {t('analyze.prevBtn', '← Previous Step')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => goNext(3)}>
                {t('analyze.nextBtn', 'Next Step →')}
              </button>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={`form-step${step === 3 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">{t('analyze.step3Title', 'Storage Environment & Distribution')}</h2>
                <p className="form-hint">{t('analyze.step3Desc', 'Define temperature, relative humidity, and how long the product must remain fresh.')}</p>
              </div>
              <span className="badge badge-neutral">3 / 4</span>
            </div>
            <div className="form-grid">
              <Field id="target_shelf_life" label={`${t('analyze.shelfLifeLabel', 'Target Shelf Life (Days)')} *`}>
                <NumericInput id="target_shelf_life" value={form.target_shelf_life} min={1} max={1000} step={1} unit="days" />
              </Field>
              <Field id="storage_temperature" label={t('analyze.tempLabel', 'Storage Temperature (°C)')}>
                <NumericInput id="storage_temperature" value={form.storage_temperature} min={-30} max={60} step={0.5} unit="°C" />
              </Field>
              <Field id="storage_rh" label={t('analyze.rhLabel', 'Storage Relative Humidity (%)')}>
                <NumericInput id="storage_rh" value={form.storage_rh} min={10} max={100} step={1} unit="%" />
              </Field>
              <Field id="storage_type" label={t('analyze.storageTypeLabel', 'Storage Mode')}>
                <select id="storage_type" className="form-control" value={form.storage_type} onChange={e => set('storage_type', e.target.value)}>
                  <option value="Ambient">{t('analyze.storageTypes.ambient', 'Ambient (Room Temp)')}</option>
                  <option value="Refrigerated">{t('analyze.storageTypes.refrigerated', 'Refrigerated (0 - 8°C)')}</option>
                  <option value="Frozen">{t('analyze.storageTypes.frozen', 'Frozen (-18°C)')}</option>
                  <option value="Controlled Atmosphere">Controlled Atmosphere (CA/MAP)</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(2)}>
                {t('analyze.prevBtn', '← Previous Step')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => goNext(4)}>
                {t('analyze.nextBtn', 'Next Step →')}
              </button>
            </div>
          </div>

          {/* STEP 4 */}
          <div className={`form-step${step === 4 ? ' active' : ''}`}>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">{t('analyze.step4Title', 'Sensitivities & Preference Profile')}</h2>
                <p className="form-hint">{t('analyze.step4Desc', 'Specify environmental degradation vulnerabilities and scoring priorities.')}</p>
              </div>
              <span className="badge badge-neutral">4 / 4</span>
            </div>
            <div className="form-grid">
              <Field id="oxygen_sensitivity" label={t('analyze.o2SensitivityLabel', 'Oxygen Sensitivity')}>
                <select id="oxygen_sensitivity" className="form-control" value={form.oxygen_sensitivity} onChange={e => set('oxygen_sensitivity', e.target.value)}>
                  <option value="Low">{t('analyze.sensitivities.low', 'Low')}</option>
                  <option value="Medium">{t('analyze.sensitivities.medium', 'Medium')}</option>
                  <option value="High">{t('analyze.sensitivities.high', 'High')}</option>
                </select>
              </Field>
              <Field id="moisture_sensitivity" label={t('analyze.moistureSensitivityLabel', 'Moisture Sensitivity')}>
                <select id="moisture_sensitivity" className="form-control" value={form.moisture_sensitivity} onChange={e => set('moisture_sensitivity', e.target.value)}>
                  <option value="Low">{t('analyze.sensitivities.low', 'Low')}</option>
                  <option value="Medium">{t('analyze.sensitivities.medium', 'Medium')}</option>
                  <option value="High">{t('analyze.sensitivities.high', 'High')}</option>
                </select>
              </Field>
              <Field id="light_sensitivity" label={t('analyze.lightSensitivityLabel', 'Light Sensitivity')}>
                <select id="light_sensitivity" className="form-control" value={form.light_sensitivity} onChange={e => set('light_sensitivity', e.target.value)}>
                  <option value="Low">{t('analyze.sensitivities.low', 'Low')}</option>
                  <option value="Medium">{t('analyze.sensitivities.medium', 'Medium')}</option>
                  <option value="High">{t('analyze.sensitivities.high', 'High')}</option>
                </select>
              </Field>
              <Field id="transport_condition" label="Logistics & Handling">
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
                🎯 {t('analyze.profileLabel', 'Optimization Profile')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { value: 'balanced', icon: '⚖️', title: t('analyze.profileBalanced', 'Balanced Performance (Recommended)') },
                  { value: 'cost_priority', icon: '💰', title: t('analyze.profileCost', 'Cost Priority Profile') },
                  { value: 'sustainability_priority', icon: '🌿', title: t('analyze.profileSust', 'Sustainability Priority Profile') },
                ].map(p => (
                  <label key={p.value} className={`radio-card${form.preference_profile === p.value ? ' selected' : ''}`}
                    onClick={() => set('preference_profile', p.value)}>
                    <input type="radio" name="preference_profile" value={p.value}
                      checked={form.preference_profile === p.value} onChange={() => set('preference_profile', p.value)}
                      style={{ marginTop: '0.25rem' }} />
                    <div>
                      <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.92rem' }}>{p.icon} {p.title}</strong>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => goBack(3)}>
                {t('analyze.prevBtn', '← Previous Step')}
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? t('analyze.evaluatingBtn', 'Evaluating...') : t('analyze.submitBtn', 'Run Full Packaging Analysis 🚀')}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
