# Next-Level Game Plan

This plan is for moving `Compliance Explained` from promising prototype to a principled system that AI can safely help scale.

The goal is not just to add features.
The goal is to make the codebase consistent enough that future AI-generated work follows strong patterns by default.

## Phase 1: Lock the Patterns

### Objective

Make the first few core features rigorous enough that they become examples for every future feature.

### What to finish

1. Finalize the core domain models

- `Obligation`
- `Endorsement`
- `CertificateHolder`
- `AdditionalCoverageNote`
- `ComparisonResult`
- `RefusalReason`
- `AuditEvent`

2. Tighten layer boundaries

- ACORD parser
- endorsement parser
- description-box parser
- obligation modeler
- comparison layer
- governance layer

3. Define canonical error/refusal types

- unreadable document
- unsupported document type
- weak evidence
- endorsement ambiguity
- invalid comparison mode
- governance refusal

### Exit criteria

- important business concepts are explicit models, not strings
- parser concerns are separated
- refusal behavior is defined
- new contributors can tell where logic belongs

## Phase 2: Make Comparison Trustworthy

### Objective

Turn the app into a real comparison engine, not just a reading tool.

### What to build

1. Deterministic comparison rules

- contract requirements vs COI/policy evidence
- `met`
- `unmet`
- `missing`

2. Evidence thresholds

- no strong state without evidence
- citation required for `present` and `met`
- weak support becomes `review` or `missing`

3. Endorsement comparison

- AI type
- ongoing ops
- completed ops
- PNC
- WOS
- form numbers

4. ACORD-aware field extraction

- certificate holder
- GL occurrence / aggregate
- products-comp ops
- auto
- WC
- EL
- umbrella
- description-box notes

### Exit criteria

- a reviewer can upload contract + COI and get a believable comparison
- the system explains mismatches clearly
- certificate wording is not confused with endorsement proof

## Phase 3: Make the Workflow Operational

### Objective

Support real review work, not just demos.

### What to build

1. Persistence

- uploaded documents
- parsed outputs
- obligations
- comparison results
- timestamps
- job records
- document relationships by job

2. Audit logging

- upload
- parse
- refusal
- escalation
- final state

3. Role-aware review flow

- reviewer view
- broker/agent view
- admin later

4. Better review UI

- required vs evidence side-by-side
- expandable citations
- AI type visible
- certificate holder visible
- additional coverage notes visible

5. Job-based repository

- account
- job / project
- contract set
- COI set
- policy / endorsement set
- current status by job
- requirement history by job

### Exit criteria

- users can return to prior reviews
- state changes are traceable
- the UI feels like a reviewer worksheet
- each job acts as its own compliance record

## Phase 4: Make It Pilot-Ready

### Objective

Ship something a small set of real users can use.

### What to build

1. File storage

- local durable storage first or S3

2. Async processing

- queue + worker for larger PDFs

3. Basic auth

- enough to separate pilot users and data

4. Staging deployment

- frontend
- backend
- storage
- logs

5. Security baseline

- authentication
- authorization
- encrypted file storage
- secrets management
- least-privilege access
- audit visibility

### Exit criteria

- pilot users can sign in
- upload docs
- review results
- return later
- trust the state labels enough to use the tool
- job data is isolated and durable
- core security controls are intentionally configured

## Phase 5: Use AI for Scale, Not Shape

### Objective

Only after the patterns are strong, let AI accelerate the rest of the build.

### Safe use of AI

Use AI for:

- adding new parsers that follow the same model
- extending coverage mappings
- building new UI screens using existing conventions
- generating tests around explicit rules

Do not use AI to invent:

- state models
- core domain boundaries
- governance policies
- error taxonomy

### Example build prompt

`Follow docs/BUILDING_GUARDRAILS.md and the existing parser/comparison patterns. Add support for x using explicit models, deterministic comparison, and refusal-safe behavior.`

## Immediate Next 6 Builds

1. formal `Endorsement` and `CertificateHolder` models
2. extract ACORD description-box lines into structured objects
3. make comparison output show `Required` and `Evidence` as separate first-class fields everywhere
4. add citation-required `met/present` rules
5. add persistence and audit event models
6. create a staging deployment path for the unified repo

## Product Tracks

The product now has distinct but related tracks:

1. `Compliance Review`

- contract / COI / policy review
- deterministic comparison
- job-based recordkeeping

2. `Business Launch Assistant`

- for brand-new business owners
- startup guidance
- what to ask lawyer, accountant, broker
- local permits and offices

3. `Expert Review Assistant`

- for more experienced users
- grounded explanations
- draft requests
- review-side chat support

These should share a product family, but remain distinct workflows.

## AWS Security Note

AWS is the infrastructure foundation, not the security decision by itself.

Being in AWS does not automatically make the system secure.

Security still must be designed through:

- authentication
- authorization
- private storage
- encryption
- secrets handling
- logging
- access boundaries
- least privilege

## What “Next Level” Means Here

Next level does not mean:

- more prompts
- more AI
- more features piled onto a weak base

Next level means:

- stronger patterns
- clearer boundaries
- explicit models
- deterministic trust
- AI following your system instead of improvising it
