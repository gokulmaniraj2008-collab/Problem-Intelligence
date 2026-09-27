import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const sources = ['Instagram', 'WhatsApp', 'Reddit', 'Interview', 'Survey', 'Observation', 'SIH', 'Business', 'Other'];
const categories = ['Money & Work', 'Healthcare', 'Education', 'Housing', 'Business', 'Transport', 'Environment', 'Technology', 'Other'];
const emptyForm = { title: '', description: '', audience: '', source: '', category: '', frequency: 'Weekly', moneyCost: '', timeCost: '', currentSolution: '' };
const emptyEvidence = { problem_id: '', source: 'Interview', persona: '', confirmed: false, pain_score: 7, current_solution: '', willingness_to_pay: '', notes: '' };

function App() {
  const [page, setPage] = useState('discover');
  const [form, setForm] = useState(emptyForm);
  const [evidenceForm, setEvidenceForm] = useState(emptyEvidence);
  const [submitted, setSubmitted] = useState(false);
  const [evidenceSaved, setEvidenceSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingEvidence, setSavingEvidence] = useState(false);
  const [dbStatus, setDbStatus] = useState('Checking Supabase…');
  const [problems, setProblems] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateEvidence = (key, value) => setEvidenceForm(prev => ({ ...prev, [key]: value }));

  async function loadProblems() {
    try {
      const response = await fetch('/api/problems');
      if (!response.ok) throw new Error('Unable to load');
      setProblems(await response.json());
      setDbStatus('Supabase connected');
    } catch { setDbStatus('API unavailable'); }
  }

  async function loadEvidence(problemId) {
    if (!problemId) return;
    try {
      const response = await fetch(`/api/evidence?problem_id=${encodeURIComponent(problemId)}`);
      if (!response.ok) throw new Error();
      setEvidence(await response.json());
    } catch { setEvidence([]); }
  }

  useEffect(() => { loadProblems(); }, []);

  async function submit(e) {
    e.preventDefault(); if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true); setSubmitted(false);
    try {
      const response = await fetch('/api/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to save');
      setSubmitted(true); setForm(emptyForm); await loadProblems();
    } catch (error) { setDbStatus(error.message || 'Unable to save'); }
    finally { setSaving(false); }
  }

  async function submitEvidence(e) {
    e.preventDefault(); if (!evidenceForm.problem_id || !evidenceForm.persona || !evidenceForm.notes.trim()) return;
    setSavingEvidence(true); setEvidenceSaved(false);
    try {
      const response = await fetch('/api/evidence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evidenceForm) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to save evidence');
      setEvidenceSaved(true); setEvidenceForm({ ...emptyEvidence, problem_id: evidenceForm.problem_id }); await loadEvidence(evidenceForm.problem_id);
    } catch (error) { setDbStatus(error.message || 'Unable to save evidence'); }
    finally { setSavingEvidence(false); }
  }

  const filteredProblems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...problems].filter(p => (!q || [p.title, p.description, p.audience, p.source, p.category].filter(Boolean).join(' ').toLowerCase().includes(q)) && (category === 'All' || p.category === category) && (status === 'All' || (p.status || 'new') === status)).sort((a, b) => sort === 'oldest' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at));
  }, [problems, search, category, status, sort]);

  const goCapture = () => { setPage('discover'); setTimeout(() => document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth' }), 20); };
  const openValidation = (problem) => { setSelectedProblem(problem); setEvidenceForm({ ...emptyEvidence, problem_id: problem.id, persona: problem.audience || '' }); setEvidenceSaved(false); loadEvidence(problem.id); setPage('validation'); };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand brand-button" onClick={() => setPage('discover')}><span className="brand-mark">PI</span><span>Problem Intelligence</span></button>
      <nav>
        <button className={page === 'discover' ? 'active' : ''} onClick={() => setPage('discover')}>Discover</button>
        <button className={page === 'problems' ? 'active' : ''} onClick={() => setPage('problems')}>Problems <b>{problems.length}</b></button>
        <button className={page === 'validation' ? 'active' : ''} onClick={() => setPage('validation')}>Validation</button>
        <button>Opportunities</button><button>Solutions</button>
      </nav>
      <button className="outline-btn" onClick={goCapture}>Submit problem</button>
    </header>

    {page === 'validation' ? <main className="dashboard-page">
      <section className="dashboard-head"><div><div className="eyebrow">03 / HUMAN VALIDATION</div><h1>Evidence beats<br /><em>assumptions.</em></h1><p>Record what a real person said, how painful the problem is, and whether they would pay for a better solution.</p></div><div className="dashboard-metrics"><div><strong>{evidence.length}</strong><span>evidence records</span></div><div><strong>{evidence.filter(x => x.confirmed).length}</strong><span>confirmed</span></div><div><strong>{evidence.filter(x => Number(x.willingness_to_pay) > 0).length}</strong><span>pay signals</span></div></div></section>
      <section className="validation-layout">
        <div className="validation-panel">
          <div className="section-heading"><div><div className="eyebrow">SELECT PROBLEM</div><h2>What are you validating?</h2></div></div>
          <select value={evidenceForm.problem_id} onChange={e => { updateEvidence('problem_id', e.target.value); const p = problems.find(x => x.id === e.target.value); setSelectedProblem(p); if (p) loadEvidence(p.id); }}><option value="">Choose a captured problem</option>{problems.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</select>
          {selectedProblem && <div className="selected-problem"><span className="pill">{selectedProblem.category || 'Uncategorized'}</span><h3>{selectedProblem.title}</h3><p>{selectedProblem.description}</p></div>}
        </div>
        <div className="validation-panel"><div className="section-heading"><div><div className="eyebrow">EVIDENCE</div><h2>Talk to one real person.</h2></div></div>
          {evidenceSaved && <div className="success">✓ Evidence saved. Add another conversation to increase confidence.</div>}
          <form onSubmit={submitEvidence}>
            <div className="grid-2"><div className="field"><label>Persona <span>*</span></label><input value={evidenceForm.persona} onChange={e => updateEvidence('persona', e.target.value)} placeholder="e.g. small shop owner" required /></div><div className="field"><label>Source</label><select value={evidenceForm.source} onChange={e => updateEvidence('source', e.target.value)}>{sources.map(s => <option key={s}>{s}</option>)}</select></div></div>
            <div className="field"><label>Pain score: {evidenceForm.pain_score}/10</label><input type="range" min="1" max="10" value={evidenceForm.pain_score} onChange={e => updateEvidence('pain_score', Number(e.target.value))} /></div>
            <div className="field"><label>Would they pay? How much?</label><input type="number" min="0" value={evidenceForm.willingness_to_pay} onChange={e => updateEvidence('willingness_to_pay', e.target.value)} placeholder="₹ per month" /></div>
            <div className="field"><label>Current workaround</label><input value={evidenceForm.current_solution} onChange={e => updateEvidence('current_solution', e.target.value)} placeholder="What do they do today?" /></div>
            <div className="field"><label>What did they actually tell you? <span>*</span></label><textarea value={evidenceForm.notes} onChange={e => updateEvidence('notes', e.target.value)} rows="5" placeholder="Write the observation or interview evidence. Don't invent it with AI." required /></div>
            <label className="check"><input type="checkbox" checked={evidenceForm.confirmed} onChange={e => updateEvidence('confirmed', e.target.checked)} /> Person explicitly confirmed this is a real problem.</label>
            <button className="primary-btn" disabled={savingEvidence}>{savingEvidence ? 'Saving…' : 'Save human evidence →'}</button>
          </form>
        </div>
      </section>
      <section className="recent"><div className="section-heading"><div><div className="eyebrow">EVIDENCE LOG</div><h2>What has been verified?</h2></div></div>{evidence.length === 0 ? <p className="empty">No evidence yet. Select a problem and record your first real conversation.</p> : <div className="problem-list">{evidence.map(x => <article key={x.id}><div><span className="pill">{x.persona}</span><h3>{x.confirmed ? 'Confirmed problem' : 'Unconfirmed evidence'}</h3><p>{x.notes}</p></div><small>Pain {x.pain_score}/10 · {x.willingness_to_pay ? `₹${x.willingness_to_pay} pay signal` : 'No pay signal'}</small></article>)}</div>}</section>
    </main> : page === 'problems' ? <main className="dashboard-page">
      <section className="dashboard-head"><div><div className="eyebrow">02 / PROBLEM DATABASE</div><h1>Problems people<br /><em>actually have.</em></h1><p>Every captured problem becomes an evidence candidate. Search, filter and prepare it for human validation.</p></div><div className="dashboard-metrics"><div><strong>{problems.length}</strong><span>captured</span></div><div><strong>{problems.filter(p => (p.status || 'new') === 'new').length}</strong><span>unvalidated</span></div><div><strong>{new Set(problems.map(p => p.category).filter(Boolean)).size}</strong><span>categories</span></div></div></section>
      <section className="problem-database"><div className="toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems, people, sources…" /><select value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option value="new">New</option><option value="validated">Validated</option><option value="rejected">Rejected</option></select><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></div>{filteredProblems.length === 0 ? <div className="empty-state"><strong>No matching problems</strong><span>Capture a real problem or change your filters.</span><button className="primary-btn" onClick={goCapture}>Capture problem →</button></div> : <div className="database-list">{filteredProblems.map((p, i) => <article className="problem-card" key={p.id}><div className="problem-number">{String(i + 1).padStart(2, '0')}</div><div className="problem-main"><div className="problem-meta"><span className="pill">{p.category || 'Uncategorized'}</span><span className={`status ${p.status || 'new'}`}>{p.status || 'new'}</span><span>{p.source || 'Unknown source'}</span></div><h2>{p.title}</h2><p>{p.description}</p><div className="problem-details"><span><b>Who</b>{p.audience || 'Not specified'}</span><span><b>Frequency</b>{p.frequency || 'Not specified'}</span><span><b>Money impact</b>{p.money_cost || 'Not estimated'}</span></div></div><div className="opportunity"><span>VALIDATE</span><button className="text-btn" onClick={() => openValidation(p)}>Open →</button></div></article>)}</div>}</section>
    </main> : <main><section className="hero"><div className="eyebrow"><span></span> PROBLEM-FIRST INTELLIGENCE</div><h1>Find what people<br /><em>actually need.</em></h1><p>Collect real problems, validate them with real people, find the money, and only then decide what to build.</p><div className="hero-stats"><div><strong>Problem → Evidence → Money</strong><small>AI proposes. Humans verify.</small></div><div><strong>Software · AI · Hardware · Service</strong><small>Let the problem choose the technology.</small></div></div></section><section className="workspace"><div className="section-heading"><div><div className="eyebrow">01 / CAPTURE</div><h2>What problem have you noticed?</h2></div><span className="required">* Required fields</span></div>{submitted && <div className="success">✓ Problem saved to Supabase. Next step: collect evidence from real people.</div>}<div className="db-status">● {dbStatus}</div><form onSubmit={submit}><div className="field full"><label>Problem in one sentence <span>*</span></label><input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Small shops lose customers because they cannot respond to enquiries quickly." required /></div><div className="field full"><label>Describe the problem <span>*</span></label><textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="What happens? Why is it painful? What gets wasted, lost, delayed or made difficult?" rows="5" required /></div><div className="grid-2"><div className="field"><label>Who experiences it?</label><input value={form.audience} onChange={e => update('audience', e.target.value)} placeholder="Students, shop owners, commuters…" /></div><div className="field"><label>Where did you discover it?</label><select value={form.source} onChange={e => update('source', e.target.value)}><option value="">Select source</option>{sources.map(s => <option key={s}>{s}</option>)}</select></div><div className="field"><label>Category</label><select value={form.category} onChange={e => update('category', e.target.value)}><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="field"><label>How often does it happen?</label><select value={form.frequency} onChange={e => update('frequency', e.target.value)}>{['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Occasionally'].map(x => <option key={x}>{x}</option>)}</select></div><div className="field"><label>Estimated money impact</label><input value={form.moneyCost} onChange={e => update('moneyCost', e.target.value)} placeholder="e.g. ₹2,000/month" /></div><div className="field"><label>Estimated time impact</label><input value={form.timeCost} onChange={e => update('timeCost', e.target.value)} placeholder="e.g. 5 hours/week" /></div></div><div className="field full"><label>How is it solved today?</label><textarea value={form.currentSolution} onChange={e => update('currentSolution', e.target.value)} placeholder="Existing app, manual process, workaround, competitor, or nothing…" rows="3" /></div><div className="form-footer"><div><strong>Start with the problem.</strong><span>AI analysis and business scoring come after evidence.</span></div><button className="primary-btn" disabled={saving}>{saving ? 'Saving…' : 'Capture problem →'}</button></div></form></section><section className="recent"><div className="section-heading"><div><div className="eyebrow">LIVE DATA</div><h2>Recently captured</h2></div><button className="text-btn" onClick={() => setPage('problems')}>View all →</button></div>{problems.length === 0 ? <p className="empty">No problems captured yet. Submit the first one above.</p> : <div className="problem-list">{problems.slice(0, 5).map(p => <article key={p.id}><div><span className="pill">{p.category || 'Uncategorized'}</span><h3>{p.title}</h3><p>{p.description}</p></div><small>{p.source || 'Unknown source'}</small></article>)}</div>}</section><section className="principles"><div><span>01</span><h3>Real problems</h3><p>Capture observations from people, businesses, interviews and communities.</p></div><div><span>02</span><h3>Real evidence</h3><p>Separate AI hypotheses from what humans actually confirmed.</p></div><div><span>03</span><h3>Real money</h3><p>Willingness to pay and customer action are stronger than an AI score.</p></div></section></main>}
    <footer><span>Problem Intelligence</span><span>AI proposes · Humans verify · Customers decide · Money proves</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
