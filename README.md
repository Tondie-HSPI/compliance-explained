# Compliance Explained

Compliance Explained helps businesses and reviewers turn contract insurance requirements and COI evidence into structured, evidence-backed compliance decisions.

## Problem

Contract and insurance compliance review is often manual, inconsistent, and difficult for non-experts to understand. Requirements are spread across contracts, Certificates of Insurance (COIs), policies, endorsements, and unstructured ACORD description boxes.

Reviewers and business owners need to quickly answer:

- What insurance is required?
- What evidence is present?
- What is missing or unmet?
- What should be requested from the broker, carrier, or business owner?

Generic document summaries are not enough because compliance workflows require structured obligations, source evidence, and clear decision states.

## Solution

Compliance Explained is a governed AI decision-support prototype that converts unstructured insurance documents into a compact obligation review workflow.

The system uses a layered architecture:

`Input -> Extraction -> Obligation Modeling -> Validation -> State Engine -> Decision Support -> Action`

Key capabilities include:

- FastAPI backend with separated workflow layers
- Next.js frontend for a compact reviewer interface
- YAML-driven rules for obligations, endorsements, and governance
- Contract, COI, and policy upload flow
- Initial ACORD-aware extraction for certificate holder and description-box notes
- Initial endorsement parsing for Additional Insured, Waiver of Subrogation, Primary & Noncontributory, and ISO form signals
- Contract-vs-evidence comparison producing states such as `met`, `unmet`, and `missing`
- Governance/refusal rules to keep outputs constrained and evidence-aware

The system is intentionally not a generic chatbot. AI may assist with interpretation, but deterministic rules and validation control compliance states.

## Why It Matters

This project is designed to reduce review time, improve consistency, and make insurance compliance easier to act on.

Business impact:

- Speeds up contract and COI review
- Helps identify missing or unmet insurance requirements earlier
- Improves communication between business owners, brokers, reviewers, and insurance professionals
- Reduces confusion for users who do not know what to ask for
- Supports evidence-backed decisions with expandable citations
- Creates a foundation for job-specific repositories of contracts, COIs, policies, endorsements, and audit history

For a portfolio reviewer, this project demonstrates practical AI product design, domain-specific workflow modeling, deterministic validation, and thoughtful separation between AI interpretation and business logic.

## Architecture Highlights

The codebase is organized around explicit responsibility boundaries:

- `extraction_layer/` parses documents and detects insurance-related sections
- `obligation_modeling/` converts extracted text into structured requirements
- `comparison_layer/` compares contract requirements against COI/policy evidence
- `endorsement_layer/` detects endorsement and form-number signals
- `governance/` enforces input guardrails, refusal rules, and output validation
- `state_engine/` assigns review states for non-comparison workflows
- `frontend/` presents a compact obligation index with review details and citations

See `docs/KEY_FILES.md` for a file-by-file explanation.

## Tech Stack

- **Frontend:** Next.js, TypeScript
- **Backend:** FastAPI, Python, Pydantic
- **Document Parsing:** Docling-ready parsing layer
- **Rules:** YAML configuration for obligations, endorsements, and governance
- **Deployment Direction:** AWS API/worker architecture with S3, queue processing, and persistence planned

## Local Development

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Health check:

```text
http://127.0.0.1:8001/health
```

Frontend:

```text
http://localhost:3000
```

## Current Status

This is an active prototype and platform foundation. The core architecture, rule-driven extraction, comparison flow, governance layer, sample documents, and reviewer UI shell are in place. The next major work is improving ACORD parsing accuracy, formalizing additional domain models, adding persistence/audit logging, and preparing a secure pilot deployment.

## Documentation

- `docs/BUILDING_GUARDRAILS.md` - project-specific engineering guardrails
- `docs/GOVERNANCE_BUILD_RULES.md` - validation and refusal rules
- `docs/KEY_FILES.md` - key file and folder guide
- `docs/NEXT_LEVEL_GAME_PLAN.md` - build strategy
- `docs/WEEKLY_EXECUTION_PLAN.md` - execution plan
- `docs/UNIFIED_ARCHITECTURE.md` - architecture overview

## Disclaimer

Compliance Explained is a decision-support prototype. It does not provide legal, tax, insurance, or professional advice. Outputs should be reviewed by qualified professionals before final decisions are made.
