# Compliance Explained

AI-powered compliance assistant that transforms contracts and Certificates of Insurance (COIs) into structured, actionable insurance requirements.

---

## Overview

Compliance Explained is a document intelligence system designed to help users understand complex insurance requirements quickly and accurately.

Users can upload contracts, COIs, or policy documents and receive:

- Structured compliance checklists  
- Extracted insurance requirements  
- Confidence scoring  
- Source-backed explanations  
- Recommended next steps  

This is not a generic chatbot — it is a **compliance interpretation engine**.

---

## Core Capabilities

### Document Parsing
- Supports contracts, COIs, and policy documents  
- Extracts structured text and sections from uploaded files  

### Requirement Extraction
Identifies key insurance requirements such as:
- General Liability limits  
- Workers Compensation  
- Commercial Auto  
- Umbrella / Excess coverage  
- Additional Insured  
- Waiver of Subrogation  
- Primary & Non-Contributory wording  
- Hired & Non-Owned Auto  

### Compliance Checklist
- Converts extracted requirements into actionable checklist items  
- Status: `met`, `missing`, or `needs_review`  
- Includes confidence scoring and reasoning  

### Decision Support
- Highlights missing requirements  
- Suggests next steps  
- Provides source-backed explanations  

### Document Chat (Planned)
- Ask questions about uploaded documents  
- Responses grounded in document content  

---

## Architecture (MVP)



Upload → Parse → Extract → Structure → Store → Retrieve → Explain


### Stack

**Frontend**
- Next.js (TypeScript)

**Backend**
- FastAPI (Python)

**AI / Processing**
- Docling (document parsing)  
- Instructor + Pydantic (structured extraction)  
- LLM (OpenAI-compatible)

**Vector Storage (Planned)**
- Qdrant or similar  

---

## How It Works

1. User uploads a document  
2. System extracts text and structure  
3. AI identifies compliance requirements using strict rules:
   - No assumptions  
   - Evidence required  
   - Missing = explicitly missing  
4. Requirements are converted into structured checklist items  
5. System returns:
   - compliance status  
   - confidence scores  
   - supporting evidence  

---

## Guardrails

- No legal advice is provided  
- All outputs require source evidence  
- Unclear items are marked as `needs_review`  
- Designed for **decision support**, not final determination  

---

## Project Structure


```
/frontend → Next.js app
/backend → FastAPI app
├── main.py
├── extract.py
├── schema.py
└── prompts.py
```

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
````

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Roadmap

* [ ] COI vs Contract comparison engine
* [ ] RAG-based document chat
* [ ] Role-based outputs (contractor / agent)
* [ ] UI improvements (checklist visualization)
* [ ] Confidence scoring enhancements
* [ ] Deployment (AWS)

---

## Vision

Compliance Explained is part of a broader shift toward **domain-specific AI systems** that:

* Prioritize accuracy over fluency
* Provide structured, auditable outputs
* Support real-world workflows

The goal is to bridge the gap between complex insurance requirements and everyday users who need to act on them.

---

## Disclaimer

This tool is for informational and educational purposes only.
It does not provide legal or insurance advice.

---

## Author

Built by someone who believes AI should make complex systems easier to navigate — not harder to trust.

```

