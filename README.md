# Compliance Explained

Compliance Explained is a governed AI decision-support platform for contract and insurance requirement review. It helps turn unstructured contracts, Certificates of Insurance (COIs), policies, and endorsements into structured obligations, comparison results, and clear next actions.

The project is designed around a simple but important idea: AI should help interpret documents, but deterministic rules and evidence-backed validation should control compliance decisions.

## The Problem

Insurance and contract compliance review is often slow, manual, and difficult to scale.

Business owners, brokers, contractors, and reviewers frequently need to answer questions such as:

- What insurance does this contract require?
- Does the COI show the required limits?
- Is Additional Insured status required, and is there evidence for it?
- Is Waiver of Subrogation required or present?
- Are umbrella, auto, workers compensation, or employer liability requirements met?
- Does certificate wording actually prove endorsement coverage?
- What should we ask the broker, carrier, lawyer, accountant, or permitting office next?

These questions are high-friction because the information is spread across contracts, COIs, endorsements, policy forms, and unstructured description boxes. Generic AI summaries can be helpful, but they are not enough for compliance workflows because they may blur the difference between extracted text, evidence, and final decision state.

## The Solution

Compliance Explained uses a layered workflow to move from messy documents to structured review outputs:

`Input -> Extraction -> Obligation Modeling -> Validation -> State Engine -> Decision Support -> Action`

The system separates responsibilities intentionally:

- **Document ingestion** parses contracts, COIs, policies, and supporting documents.
- **Extraction logic** identifies insurance-related language, ACORD sections, certificate holder details, description-box notes, and endorsement signals.
- **Obligation modeling** converts document language into structured requirements.
- **Comparison logic** evaluates contract requirements against COI/policy evidence.
- **State engine** assigns decision states such as `met`, `unmet`, `missing`, `required`, or `present`, depending on review mode.
- **Governance layer** applies guardrails, refusal rules, and output validation.
- **Decision support layer** provides explanations and next actions without replacing human judgment.

This is not a generic chatbot. It is a governed compliance workflow with AI-assisted interpretation inside deterministic review boundaries.

## Business Value

Compliance Explained is built to reduce the time and uncertainty involved in reviewing insurance requirements.

Potential value includes:

- Faster contract and COI review
- More consistent requirement extraction
- Clearer visibility into what is required, present, missing, or unmet
- Better communication between business owners, brokers, reviewers, and insurance professionals
- Evidence-backed review outputs with expandable citations
- Reduced confusion for new business owners who do not yet know what to ask
- A foundation for job-specific repositories of contracts, certificates, policies, endorsements, and audit history

The long-term goal is to support both experienced reviewers and brand-new business owners through separate but connected workflows:

- **Compliance Review** for document comparison and requirement tracking
- **Expert Review Assistant** for grounded explanations and email drafting tied to specific jobs
- **Business Launch Assistant** for new owners who need plain-English guidance, professional questions, and local resource lookup

## What This Prototype Demonstrates

This branch contains a platform prototype showing the architectural foundation for the product.

Implemented or scaffolded capabilities include:

- FastAPI backend with layered workflow modules
- Next.js frontend shell for a compact obligation index
- YAML-driven rules for obligations, endorsements, and governance
- Contract, COI, and policy upload flow
- Requirement extraction for common insurance lines
- Initial ACORD-aware parsing for certificate holder and description-box notes
- Initial endorsement parser for Additional Insured, Waiver of Subrogation, Primary & Noncontributory, and common ISO form signals
- Contract-vs-evidence comparison layer
- Governance/refusal rules and output validation
- Sample documents for testing contract-only, COI-only, and comparison workflows
- Planning docs for system guardrails, weekly execution, and next-level build strategy

## Architecture Principles

The project is intentionally built around senior software engineering patterns:

- Clear logic boundaries
- Explicit domain models
- Deterministic business rules before generative reasoning
- Structured outputs instead of loose prose
- Refusal and escalation as product behavior
- Separation between parsing, modeling, comparison, governance, and UI presentation
- Evidence-backed states with citations
- A path toward auditability, persistence, and role-aware workflows

See:

- `docs/BUILDING_GUARDRAILS.md`
- `docs/GOVERNANCE_BUILD_RULES.md`
- `docs/KEY_FILES.md`
- `docs/NEXT_LEVEL_GAME_PLAN.md`
- `docs/WEEKLY_EXECUTION_PLAN.md`
- `docs/UNIFIED_ARCHITECTURE.md`

## Current Repo Structure

```text
backend/
  app/
    api/                 FastAPI routes
    comparison_layer/    Contract-vs-evidence comparison logic
    decision_support/    Explanation and next-action layer
    endorsement_layer/   Endorsement/form signal parser
    extraction_layer/    Document and insurance section parsing
    governance/          Guardrails, refusal, and output validation
    input_layer/         Intake state creation
    obligation_modeling/ Requirement and obligation modeling
    rules/               YAML rules for obligations, endorsements, governance
    schemas/             Pydantic domain/API models
    services/            Analysis orchestration services
    state_engine/        Decision-state assignment
    validation_layer/    Evidence and required-field validation
frontend/
  app/                   Next.js review interface prototype
worker/                  Async worker scaffold
infra/                   AWS deployment notes and queue plan
samples/                 Sample contracts, COIs, and policy documents
docs/                    Architecture, guardrails, and build plans
```

For a file-by-file explanation of the key modules, see `docs/KEY_FILES.md`.

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Health check:

```text
http://127.0.0.1:8001/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Review Modes

The system uses different language depending on the task:

- **Contract reading:** `required` / `not required`
- **COI or policy reading:** `present` / `not present`
- **Contract vs COI/policy comparison:** `met` / `unmet` / `missing`

This keeps the UI aligned with the actual reviewer workflow.

## Roadmap

Near-term priorities:

- Strengthen ACORD field extraction
- Formalize `Endorsement`, `CertificateHolder`, `AdditionalCoverageNote`, and `ComparisonResult` models
- Improve endorsement comparison logic for AI, WOS, PNC, ongoing operations, completed operations, and ISO form numbers
- Add job/project-based repositories for contracts, COIs, policies, endorsements, and review history
- Add persistence, audit logging, and file storage
- Add role-aware workflows and job-aware email drafting
- Prepare an AWS staging deployment with intentional security controls

Longer-term priorities:

- Business Launch Assistant for new business owners
- Expert Review Assistant for experienced users
- Local resource lookup using external data sources such as Google Places
- Auth, authorization, and account/job data separation
- Production-ready AWS architecture using S3, queue/worker processing, database persistence, and secrets management

## Disclaimer

Compliance Explained is a decision-support prototype. It does not provide legal, tax, insurance, or professional advice. Outputs should be reviewed by qualified professionals before being used for final decisions.
