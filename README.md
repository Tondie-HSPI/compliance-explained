# Compliance Explained Platform

Compliance Explained is a governed decision-support system that turns unstructured contract and insurance documents into structured obligations, validated decision states, and clear next actions.

This repo combines:

- the product direction from Compliance Explained
- the async service shape from HarmonySync
- the governance and state model from Role-Aware AI Orchestration

## Core Principle

This is not a chatbot.

This is a governed workflow:

`unstructured documents -> structured obligations -> validated states -> decision support -> action`

## Repo Shape

- `backend/`: FastAPI API and core workflow layers
- `worker/`: async processing service for queued jobs
- `frontend/`: Next.js shell for the obligation index UI
- `docs/`: architecture, roadmap, and product framing
- `infra/`: AWS deployment templates and notes
- `samples/`: starter payload examples

## Backend Layers

- `input_layer/`
- `extraction_layer/`
- `obligation_modeling/`
- `validation_layer/`
- `state_engine/`
- `decision_support/`
- `governance/`

## Next Step

Start by implementing the obligation index end-to-end:

1. intake documents
2. extract obligations
3. validate against evidence
4. assign decision state
5. show compact results with expandable citations

