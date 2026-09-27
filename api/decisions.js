import { createClient } from '@supabase/supabase-js';
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const allowed=['BUILD','VALIDATE MORE','WATCH','STOP'];
export default async function handler(req,res){try{
 if(req.method==='GET'){let q=supabase.from('decisions').select('*').order('created_at',{ascending:false}).limit(100);if(req.query?.problem_id)q=q.eq('problem_id',req.query.problem_id);const {data,error}=await q;if(error)return res.status(500).json({error:error.message});return res.status(200).json(data||[])}
 if(req.method==='POST'){const b=req.body||{};if(!b.problem_id||!allowed.includes(b.decision))return res.status(400).json({error:'A valid decision is required'});const row={problem_id:b.problem_id,decision:b.decision,notes:b.notes||''};const {data,error}=await supabase.from('decisions').upsert(row,{onConflict:'problem_id'}).select().single();if(error)return res.status(400).json({error:error.message});return res.status(200).json(data)}
 res.setHeader('Allow',['GET','POST']);return res.status(405).json({error:'Method not allowed'})
}catch(e){return res.status(500).json({error:e.message||'Unexpected server error'})}}
