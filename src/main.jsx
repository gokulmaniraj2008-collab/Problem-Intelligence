import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const sources = ['Instagram', 'WhatsApp', 'Reddit', 'Interview', 'Survey', 'Observation', 'SIH', 'Business', 'Other'];
const categories = ['Money & Work', 'Healthcare', 'Education', 'Housing', 'Business', 'Transport', 'Environment', 'Technology', 'Other'];

function App() {
  const [form, setForm] = useState({ title: '', description: '', audience: '', source: '', category: '', frequency: 'Weekly', moneyCost: '', timeCost: '', currentSolution: '' });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Unable to save');
      setSubmitted(true);
      setForm({ title: '', description: '', audience: '', source: '', category: '', frequency: 'Weekly', moneyCost: '', timeCost: '', currentSolution: '' });
    } catch {
      const saved = JSON.parse(localStorage.getItem('pi-problems') || '[]');
      localStorage.setItem('pi-problems', JSON.stringify([{ ...form, localId: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...saved]));
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">PI</span><span>Problem Intelligence</span></div>
        <nav><a className="active">Discover</a><a>Problems</a><a>Validation</a><a>Opportunities</a><a>Solutions</a></nav>
        <button className="outline-btn">Explore problems</button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><span></span> PROBLEM-FIRST INTELLIGENCE</div>
          <h1>Find what people<br /><em>actually need.</em></h1>
          <p>Collect real problems, validate them with real people, find the money, and only then decide what to build.</p>
          <div className="hero-stats"><div><strong>Problem → Evidence → Money</strong><small>AI proposes. Humans verify.</small></div><div><strong>Software · AI · Hardware · Service</strong><small>Let the problem choose the technology.</small></div></div>
        </section>

        <section className="workspace">
          <div className="section-heading"><div><div className="eyebrow">01 / CAPTURE</div><h2>What problem have you noticed?</h2></div><span className="required">* Required fields</span></div>
          {submitted && <div className="success">✓ Problem captured. Next step: collect evidence from real people.</div>}
          <form onSubmit={submit}>
            <div className="field full"><label>Problem in one sentence <span>*</span></label><input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Small shops lose customers because they cannot respond to enquiries quickly." required /></div>
            <div className="field full"><label>Describe the problem <span>*</span></label><textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="What happens? Why is it painful? What gets wasted, lost, delayed or made difficult?" rows="5" required /></div>
            <div className="grid-2">
              <div className="field"><label>Who experiences it?</label><input value={form.audience} onChange={e => update('audience', e.target.value)} placeholder="Students, shop owners, commuters…" /></div>
              <div className="field"><label>Where did you discover it?</label><select value={form.source} onChange={e => update('source', e.target.value)}><option value="">Select source</option>{sources.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="field"><label>Category</label><select value={form.category} onChange={e => update('category', e.target.value)}><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="field"><label>How often does it happen?</label><select value={form.frequency} onChange={e => update('frequency', e.target.value)}>{['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Occasionally'].map(x => <option key={x}>{x}</option>)}</select></div>
              <div className="field"><label>Estimated money impact</label><input value={form.moneyCost} onChange={e => update('moneyCost', e.target.value)} placeholder="e.g. ₹2,000/month" /></div>
              <div className="field"><label>Estimated time impact</label><input value={form.timeCost} onChange={e => update('timeCost', e.target.value)} placeholder="e.g. 5 hours/week" /></div>
            </div>
            <div className="field full"><label>How is it solved today?</label><textarea value={form.currentSolution} onChange={e => update('currentSolution', e.target.value)} placeholder="Existing app, manual process, workaround, competitor, or nothing…" rows="3" /></div>
            <div className="form-footer"><div><strong>Start with the problem.</strong><span>AI analysis and business scoring come after evidence.</span></div><button className="primary-btn" disabled={saving}>{saving ? 'Saving…' : 'Capture problem →'}</button></div>
          </form>
        </section>

        <section className="principles"><div><span>01</span><h3>Real problems</h3><p>Capture observations from people, businesses, interviews and communities.</p></div><div><span>02</span><h3>Real evidence</h3><p>Separate AI hypotheses from what humans actually confirmed.</p></div><div><span>03</span><h3>Real money</h3><p>Willingness to pay and customer action are stronger than an AI score.</p></div></section>
      </main>
      <footer><span>Problem Intelligence</span><span>AI proposes · Humans verify · Customers decide · Money proves</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
