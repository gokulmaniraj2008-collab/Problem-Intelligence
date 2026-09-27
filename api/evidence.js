import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const problemId = req.query?.problem_id;
      let query = supabase.from('evidence').select('*').order('created_at', { ascending: false }).limit(100);
      if (problemId) query = query.eq('problem_id', problemId);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === 'POST') {
      const { problem_id, source, persona, confirmed, pain_score, current_solution, willingness_to_pay, notes } = req.body ?? {};
      if (!problem_id || !persona || !notes?.trim()) return res.status(400).json({ error: 'Problem, persona and evidence notes are required' });
      if (pain_score != null && (Number(pain_score) < 1 || Number(pain_score) > 10)) return res.status(400).json({ error: 'Pain score must be 1–10' });
      const { data, error } = await supabase.from('evidence').insert({ problem_id, source: source || null, persona, confirmed: confirmed === true, pain_score: pain_score == null ? null : Number(pain_score), current_solution: current_solution || null, willingness_to_pay: willingness_to_pay === '' || willingness_to_pay == null ? null : Number(willingness_to_pay), notes: notes.trim() }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
