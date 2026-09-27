import { createClient } from '@supabase/supabase-js';
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const clamp=v=>Math.max(1,Math.min(10,Number(v)||1));
const calculateScore=s=>Number(((clamp(s.people_score)*.20+clamp(s.pain_score)*.20+clamp(s.wtp_score)*.25+clamp(s.market_score)*.15+clamp(s.gap_score)*.10+clamp(s.feasibility_score)*.10)*10).toFixed(1));
export default async function handler(req,res){try{
 if(req.method==='GET'){let q=supabase.from('scores').select('*').order('final_score',{ascending:false}).limit(100);if(req.query?.problem_id)q=q.eq('problem_id',req.query.problem_id);const {data,error}=await q;if(error)return res.status(500).json({error:error.message});return res.status(200).json(data||[])}
 if(req.method==='POST'||req.method==='PATCH'){const b=req.body||{};if(!b.problem_id)return res.status(400).json({error:'Problem id is required'});const row={problem_id:b.problem_id,people_score:clamp(b.people_score),pain_score:clamp(b.pain_score),wtp_score:clamp(b.wtp_score),market_score:clamp(b.market_score),gap_score:clamp(b.gap_score),feasibility_score:clamp(b.feasibility_score),human_score:b.human_score==null?null:Number(b.human_score),ai_score:b.ai_score==null?null:Number(b.ai_score),final_score:calculateScore(b),updated_at:new Date().toISOString()};const {data,error}=await supabase.from('scores').upsert(row,{onConflict:'problem_id'}).select().single();if(error)return res.status(400).json({error:error.message});return res.status(200).json(data)}
 res.setHeader('Allow',['GET','POST','PATCH']);return res.status(405).json({error:'Method not allowed'})
}catch(e){return res.status(500).json({error:e.message||'Unexpected server error'})}}
