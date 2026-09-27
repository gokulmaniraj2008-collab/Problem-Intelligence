import { createClient } from '@supabase/supabase-js';
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
export default async function handler(req,res){try{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'GEMINI_API_KEY is not configured on the server'});
 const id=req.body?.problem_id;if(!id)return res.status(400).json({error:'problem_id is required'});
 const [{data:problem,error:pErr},{data:evidence,error:eErr},{data:score,error:sErr}]=await Promise.all([
  supabase.from('problems').select('*').eq('id',id).single(),
  supabase.from('evidence').select('*').eq('problem_id',id).order('date',{ascending:false}).limit(50),
  supabase.from('scores').select('*').eq('problem_id',id).maybeSingle()
 ]);
 if(pErr||eErr||sErr)return res.status(500).json({error:(pErr||eErr||sErr).message});
 const prompt=`You are a research assistant for Problem Intelligence. Do not invent facts. Separate hypotheses from evidence. Return ONLY valid JSON with keys: summary, affected_personas, root_causes, pain_points, frequency_hypothesis, economic_impact_hypothesis, existing_alternatives, validation_questions, suggested_solution_types, suggested_scores. suggested_scores must contain people_score,pain_score,wtp_score,market_score,gap_score,feasibility_score from 1-10 and must be explicitly labeled as hypotheses. If evidence is insufficient, say so in summary and questions. Problem: ${JSON.stringify(problem)} Evidence: ${JSON.stringify(evidence||[])} Existing score: ${JSON.stringify(score||null)}`;
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})});
 const raw=await r.json();if(!r.ok)return res.status(502).json({error:raw?.error?.message||'Gemini request failed'});
 const text=raw?.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('')||'{}';let result;try{result=JSON.parse(text)}catch{result={summary:text,affected_personas:[],root_causes:[],pain_points:[],frequency_hypothesis:'',economic_impact_hypothesis:'',existing_alternatives:[],validation_questions:['Validate these claims with real people.'],suggested_solution_types:[],suggested_scores:{}}}
 return res.status(200).json(result);
}catch(e){return res.status(500).json({error:e.message||'Unexpected server error'})}}
