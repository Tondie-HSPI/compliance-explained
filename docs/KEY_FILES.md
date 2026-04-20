# Key Files

This guide explains the purpose of the most important files in the project.

## Backend

### `backend/app/main.py`

FastAPI application entry point.

Responsibilities:

- creates the API application
- configures CORS
- registers health and analysis routes
- handles governance refusal responses

### `backend/app/api/routes/analysis.py`

HTTP API routes for analysis workflows.

Responsibilities:

- accepts structured analysis requests
- accepts multipart file uploads
- exposes queued-analysis scaffold

### `backend/app/services/analysis_service.py`

Main orchestration service for the review pipeline.

Responsibilities:

- creates intake state
- applies governance rules
- parses documents
- models obligations
- validates evidence
- runs comparison mode when contract and evidence documents are both present
- returns structured analysis results

### `backend/app/services/upload_analysis_service.py`

Upload-specific service that converts uploaded files into the internal request model.

Responsibilities:

- reads uploaded files
- infers or accepts document types
- preserves binary payloads for PDF parsing
- forwards the request into `AnalysisService`

### `backend/app/extraction_layer/insurance_parser.py`

Document parsing and insurance-section detection layer.

Responsibilities:

- parses PDF, Markdown, and text files
- uses Docling when possible
- detects insurance-related sections
- extracts ACORD-style certificate holder and description-box signals

### `backend/app/obligation_modeling/modeler.py`

Converts extracted document sections into structured insurance obligations.

Responsibilities:

- creates obligation objects
- extracts limits, parties, certificate holder, and coverage notes
- adds endorsement details where detected
- applies YAML-driven obligation rules

### `backend/app/comparison_layer/comparator.py`

Deterministic contract-vs-evidence comparison layer.

Responsibilities:

- compares contract requirements against COI/policy evidence
- evaluates limits, parties, and endorsement signals
- produces `met`, `unmet`, or `missing` decision items

### `backend/app/endorsement_layer/parser.py`

Endorsement signal parser.

Responsibilities:

- detects common ISO form numbers
- extracts Additional Insured, Waiver of Subrogation, and Primary & Noncontributory signals
- supports deterministic endorsement comparison

### `backend/app/governance/constraints.py`

Governance and refusal layer.

Responsibilities:

- validates supported roles and document types
- blocks insufficient or unsafe inputs
- validates output shape
- prevents prohibited claims such as guaranteed compliance

### `backend/app/state_engine/engine.py`

State assignment layer for non-comparison workflows.

Responsibilities:

- converts modeled obligations into decision states
- supports contract-only and evidence-only review modes

### `backend/app/schemas/analysis.py`

Central Pydantic schema definitions.

Responsibilities:

- defines request and response models
- defines parsed documents, obligations, validation results, and decision items
- keeps API shape explicit and structured

## Rules

### `backend/app/rules/obligations.yaml`

YAML configuration for insurance obligation detection.

Includes:

- General Liability
- Additional Insured
- Waiver of Subrogation
- Umbrella / Excess
- Automobile Liability
- Workers Compensation
- Employers Liability
- Certificate Holder
- Additional Coverage Notes

### `backend/app/rules/endorsements.yaml`

YAML configuration for endorsement and form-number detection.

Includes:

- AI ongoing operations
- AI completed operations
- Primary & Noncontributory
- Waiver of Subrogation
- common ISO form patterns

### `backend/app/rules/governance.yaml`

YAML configuration for guardrails and output validation.

Includes:

- allowed roles
- allowed document types
- prompt-injection indicators
- prohibited output claims
- required decision fields

## Frontend

### `frontend/app/page.tsx`

Main Next.js review interface.

Responsibilities:

- handles file upload
- lets users assign document types per file
- calls the backend analysis API
- displays comparison results in a compact reviewer table
- shows review details and expandable citations

### `frontend/app/globals.css`

Global styles for the review interface.

Responsibilities:

- layout
- reviewer table styling
- state chip colors
- responsive behavior

## Worker and Infrastructure

### `worker/worker.py`

Placeholder worker process for future async document analysis.

### `infra/aws/QUEUE_PLAN.md`

Plan for moving long-running document work into an AWS queue/worker architecture.

## Documentation

### `docs/BUILDING_GUARDRAILS.md`

Project-specific build standards for Compliance Explained.

### `docs/GOVERNANCE_BUILD_RULES.md`

Governance, validation, and refusal rules mapped into product behavior.

### `docs/NEXT_LEVEL_GAME_PLAN.md`

Strategic build plan for moving from prototype to pilot-ready product.

### `docs/WEEKLY_EXECUTION_PLAN.md`

Day-by-day build plan for focused execution.

### `docs/UNIFIED_ARCHITECTURE.md`

Architecture overview combining Compliance Explained, HarmonySync, and role-aware orchestration concepts.

## Samples

### `samples/`

Text sample pack for testing:

- contract-only review
- COI-only review
- contract-vs-COI comparison
- unmet limits
- missing WOS
- policy-backed evidence
