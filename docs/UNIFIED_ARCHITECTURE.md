# Unified Architecture

## Position

Compliance Explained is a decision system with governed AI inside it.

The platform combines:

- HarmonySync's async ingestion and cloud-service split
- Role-Aware AI Orchestration's constraint hierarchy and stateful execution
- Compliance Explained's obligation modeling and deterministic review

## System Flow

`Input -> Extraction -> Obligation Modeling -> Validation -> State Engine -> Decision Support -> Action`

## Constraint Hierarchy

1. Deterministic rules
2. Retrieved document context
3. LLM interpretation

## Service Layout

### API

- receives uploads
- stores job metadata
- triggers background analysis
- serves obligation index results

### Worker

- parses PDFs and documents
- extracts structured obligations
- validates against supporting evidence
- computes decision states

### Frontend

- compact obligation index
- overall confidence
- search terms
- expandable citations
- role-based views later

## Domain Objects

### Obligation

- type
- requirement
- source
- search_terms
- confidence
- dependency

### Validation Result

- matched_evidence
- missing_fields
- comparison_notes

### Decision State

- met
- missing
- needs_review
- not_applicable

### Action Recommendation

- explanation
- next_action
- outbound_email_template_ref

## AWS Direction

- API: App Runner or ECS
- Worker: ECS service or SQS-triggered compute
- Storage: S3
- Queue: SQS
- State: Postgres
- Secrets: Secrets Manager

