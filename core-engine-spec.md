# Problem Intelligence — Core Engine v1

## Purpose
Turn collected problems and validation evidence into transparent, repeatable opportunity scores. The engine must support human review and must never present an AI score as guaranteed market truth.

## Canonical pipeline
Problem → Evidence → Scoring → Opportunity → Experiment → Result → Decision

## Core entities
- `problems`: source, title, description, category, persona, geography, status
- `evidence`: problem_id, source_type, note, severity, frequency, willingness_to_pay, created_at
- `opportunity_scores`: problem_id, reach, pain, frequency, willingness_to_pay, feasibility, evidence_strength, competition, total_score, model_version, created_at
- `experiments`: problem_id, hypothesis, target_users, tested_users, meaningful_actions, paid_customers, learning, status
- `decisions`: problem_id, decision, reason, score, created_at
- `watchlist`: problem_id, user_id, status, created_at

## Weighted score
Default 100-point model:
- Pain: 20%
- Frequency: 15%
- Reach: 15%
- Willingness to pay: 20%
- Feasibility: 10%
- Evidence strength: 15%
- Competition/defensibility: 5%

`total_score = Σ(normalized_factor × weight)`

All factors are 0–10 before normalization. Store the raw factors so humans can audit the score.

## Evidence rules
1. User-reported evidence is stored separately from AI-generated interpretation.
2. Payment behavior is stronger evidence than stated interest.
3. A single source cannot create a high-confidence opportunity by itself.
4. AI may summarize, cluster, and recommend; humans approve important scoring/decision changes.
5. Every generated score stores `model_version` and timestamp.

## Decision bands
- 75–100: BUILD candidate — run a smallest paid MVP before scaling.
- 45–74: ITERATE — gather stronger evidence or change segment/offer.
- 0–44: RESEARCH — do not scale the build yet.

These are product heuristics, not guarantees.

## Supabase implementation direction
Use PostgreSQL tables, Row Level Security, database functions for deterministic scoring, and API/server routes for orchestration. Keep service-role keys server-side only. Never expose secrets in the browser or GitHub.

## AI workflow
1. Receive new evidence.
2. Classify category/persona/problem pattern.
3. Extract structured factors with confidence.
4. Save AI interpretation separately from source evidence.
5. Run deterministic weighted scoring.
6. Generate a concise explanation referencing the stored factors.
7. Ask for human approval where configured.
8. Re-score when new evidence arrives.

## Next engineering priority
Connect existing pages to these canonical tables and replace duplicated client-side heuristics with one server-side scoring function. Then add an audit log for every score and decision change.
