import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export default async function handler(req,res){try{
 if(req.method==='GET'){let q=supabase.from('solutions').select('*').order('created_at',{ascending:false}); if(req.query?.problem_id) q=q.eq('problem_id',req.query.problem_id); const {data,error}=await q; if(error)return res.status(500).json({error:error.message}); return res.status(200).json(data||[])}
 if(req.method==='POST'){const b=req.body||{}; if(!b.problem_id||!b.name)return res.status(400).json({error:'problem_id and name are required'}); const row={problem_id:b.problem_id,name:b.name,description:b.description||'',solution_type:b.solution_type||'Software',customer:b.customer||'',pricing:b.pricing||'',competition:b.competition||'',feasibility:b.feasibility==null?5:Number(b.feasibility),status:b.status||'idea'}; const {data,error}=await supabase.from('solutions').insert(row).select().single(); if(error)return res.status(400).json({error:error.message}); return res.status(201).json(data)}
 return res.status(405).json({error:'Method not allowed'})
}catch(e){return res.status(500).json({error:e.message||'Unexpected server error'})}}
