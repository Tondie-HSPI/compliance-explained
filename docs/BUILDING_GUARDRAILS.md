# Building Guardrails

This document is the grounding spec for building `Compliance Explained`.

It exists to keep new features consistent, especially when AI helps generate code.

## Core Rule

AI may help implement the system.
AI may not define the system.

The architecture, boundaries, state model, and governance rules come first.

## Product Definition

Compliance Explained is a governed decision-support system for insurance requirements.

It is not:

- a general chatbot
- a freeform contract summarizer
- an autonomous decision-maker

It is:

- unstructured document intake
- structured obligation modeling
- deterministic validation
- explicit decision states
- guided next actions

## Responsibility Separation

### LLM / AI

Allowed:

- interpretation
- summarization
- extraction help
- explanation
- plain-English translation

Not allowed:

- final compliance decisions
- silent rule overrides
- unsupported legal conclusions
- unsupported endorsement certification

### Application Layer

Responsible for:

- routing
- schema enforcement
- refusal logic
- validation
- thresholds
- state transitions
- audit behavior

### Deterministic / Rules Layer

Responsible for:

- coverage comparison
- requirement thresholds
- endorsement matching
- allowed state assignment
- governance enforcement

### Data Layer

Responsible for:

- parsed documents
- extracted obligation objects
- endorsements
- certificate holder
- decision records
- audit logs

## Non-Negotiable Patterns

### 1. Boundaries first

New logic should go into the smallest correct layer.

Do not mix:

- parsing and UI formatting
- comparison and explanation text
- storage and business logic
- governance and presentation labels

### 2. Structured domain models first

Do not add meaningful behavior around anonymous dictionaries when a domain object should exist.

Prefer explicit models for:

- obligation
- endorsement
- certificate holder
- comparison result
- refusal reason
- audit event

### 3. Deterministic before generative

If a rule can be checked with code, check it with code.

Use AI only for:

- ambiguity
- translation
- extraction support
- explanation

### 4. Refusal is a product behavior

Refusal is not an error page.

The system should refuse or escalate when:

- inputs are missing
- evidence is weak
- scope is unsupported
- document state is ambiguous
- endorsement proof is insufficient

### 5. Evidence-backed states only

Do not allow strong states without support.

Examples:

- `met` requires comparison support
- `present` requires evidence
- AI on a COI does not equal endorsement proof by itself
- certificate holder does not equal additional insured

## State Language

The backend owns canonical states.
The UI may translate them by mode.

### Canonical backend states

- `met`
- `needs_review`
- `missing`

### UI language by mode

Contract reading:

- `required`
- `not required`

Evidence reading:

- `present`
- `not present`

Comparison:

- `met`
- `unmet`
- `missing`

## File and Module Expectations

### Parsers

Keep specialized parsers separate:

- ACORD parser
- endorsement parser
- description-box parser

### Comparison

Comparison logic must be deterministic and testable.

Keep it separate from:

- UI labels
- explanation text
- upload logic

### Governance

Governance should contain:

- input guardrails
- refusal triggers
- output validation
- prohibited claims

### UI

The UI should reflect workflow, not implementation details.

Prefer:

- required vs evidence side-by-side
- expandable citations
- compact reviewer scan

Avoid:

- raw dumps
- backend IDs in the main screen
- confidence scores without context

## Before Adding a New Feature

Ask:

1. Which layer owns this?
2. Is this deterministic or generative?
3. Should this be a new domain model?
4. What refusal or review condition applies?
5. What evidence is required before showing a strong state?
6. Is the UI exposing the right business meaning?

## Definition of Done

A feature is not done just because it runs.

A feature is done when:

- it sits in the right layer
- it uses explicit models
- refusal behavior is defined
- state behavior is defined
- UI language matches the review task
- it is consistent with existing patterns

## Current Build Priorities

1. deterministic comparison engine
2. endorsement parser
3. ACORD description-box parser
4. persistence and audit logging
5. role-aware reviewer workflow

## Short Build Prompt

When using AI to generate code for this repo, use this guidance:

`Follow the architecture and conventions in docs/BUILDING_GUARDRAILS.md. Keep parsing, comparison, governance, and UI concerns separated. Prefer explicit domain models and deterministic validation over freeform logic.`
