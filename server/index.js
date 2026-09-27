import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  service: 'problem-intelligence-api',
  database: supabase ? 'supabase' : 'not-configured'
}));

app.get('/api/problems', async (_req, res) => {
  if (!supabase) return res.json([]);

  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: 'Unable to load problems', details: error.message });
  res.json(data ?? []);
});

app.post('/api/problems', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' });

  const {
    title,
    description,
    audience,
    source,
    category,
    frequency,
    moneyCost,
    timeCost,
    currentSolution
  } = req.body;

  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const { data, error } = await supabase
    .from('problems')
    .insert({
      title: title.trim(),
      description: description.trim(),
      audience: audience || null,
      source: source || null,
      category: category || null,
      frequency: frequency || null,
      money_cost: moneyCost || null,
      time_cost: timeCost || null,
      current_solution: currentSolution || null
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: 'Unable to save problem', details: error.message });
  res.status(201).json(data);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on ${port}`));
