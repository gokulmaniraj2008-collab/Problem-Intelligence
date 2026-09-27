import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const clamp = (value) => Math.max(1, Math.min(10, Number(value) || 1));

function calculateScore(scores) {
  // Weighted business potential: reach 15%, pain 20%, willingness to pay 20%,
  // market 15%, gap 15%, feasibility 15%.
  const weighted =
    clamp(scores.people_score) * 0.15 +
    clamp(scores.pain_score) * 0.20 +
    clamp(scores.wtp_score) * 0.20 +
    clamp(scores.market_score) * 0.15 +
    clamp(scores.gap_score) * 0.15 +
    clamp(scores.feasibility_score) * 0.15;
  return Number((weighted * 10).toFixed(1));
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const problemId = req.query?.problem_id;
      let query = supabase.from('scores').select('*').order('final_score', { ascending: false }).limit(100);
      if (problemId) query = query.eq('problem_id', problemId);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      const body = req.body ?? {};
      if (!body.problem_id) return res.status(400).json({ error: 'Problem id is required' });
      const values = {
        problem_id: body.problem_id,
        people_score: clamp(body.people_score),
        pain_score: clamp(body.pain_score),
        wtp_score: clamp(body.wtp_score),
        market_score: clamp(body.market_score),
        gap_score: clamp(body.gap_score),
        feasibility_score: clamp(body.feasibility_score),
        human_score: body.human_score == null ? null : Number(body.human_score),
        ai_score: body.ai_score == null ? null : Number(body.ai_score),
        final_score: calculateScore(body),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('scores').upsert(values, { onConflict: 'problem_id' }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
