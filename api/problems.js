import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === 'POST') {
      const { title, description, audience, source, category, frequency, moneyCost, timeCost, currentSolution } = req.body ?? {};
      if (!title?.trim() || !description?.trim()) return res.status(400).json({ error: 'Title and description are required' });
      const { data, error } = await supabase.from('problems').insert({ title: title.trim(), description: description.trim(), audience: audience || null, source: source || null, category: category || null, frequency: frequency || null, money_cost: moneyCost || null, time_cost: timeCost || null, current_solution: currentSolution || null }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data);
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body ?? {};
      if (!id) return res.status(400).json({ error: 'Problem id is required' });
      const allowed = ['status', 'category', 'industry', 'audience', 'source'];
      const patch = Object.fromEntries(Object.entries(updates).filter(([key]) => allowed.includes(key)));
      const { data, error } = await supabase.from('problems').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'OPTIONS') return res.status(204).end();
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
