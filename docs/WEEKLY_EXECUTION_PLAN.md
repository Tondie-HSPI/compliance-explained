# Weekly Execution Plan

This is the fastest realistic path to get `Compliance Explained` meaningfully further by the end of this week.

The goal is not “finish everything.”
The goal is to finish the highest-leverage core in the right order.

## Day 1: Stabilize the Review Core

### Focus

Make the current comparison flow reliable enough to iterate on.

### Build

- fix any remaining duplicate-row issues
- make `Required` vs `Evidence` display consistent
- verify document type selection works per file
- verify comparison mode always activates when contract + COI/policy are uploaded
- clean up `Certificate Holder` display

### End of day outcome

- one obligation per row
- comparison table readable
- no obvious mode confusion

## Day 2: Finish ACORD and Description-Box Extraction

### Focus

Pull more real insurance signals from COIs.

### Build

- refine ACORD extraction for:
  - GL
  - umbrella
  - auto
  - WC
  - EL
  - certificate holder
- improve description-box parsing
- surface `Additional Coverage Notes` cleanly
- make unknown coverage lines appear as additional notes instead of being lost

### End of day outcome

- real COI samples produce fuller insurance rows
- remarks/description box adds useful signals

## Day 3: Finish Endorsement Parsing

### Focus

Make AI/WOS/PNC logic more trustworthy.

### Build

- formalize endorsement parsing for:
  - AI ongoing ops
  - AI completed ops
  - blanket AI
  - PNC
  - WOS
  - common ISO forms
- improve AI subtype rendering in the UI
- make mismatch logic clearer in comparison mode

### End of day outcome

- AI rows show more than just party names
- endorsement mismatches produce believable `unmet` results

## Day 4: Add Trust and Traceability

### Focus

Make the system behave more like a governed product.

### Build

- add citation-required rules for strong states
- add clearer refusal and weak-evidence handling
- add basic audit event models
- start saving structured run outputs locally or in a lightweight persistence layer
- define job/project record structure

### End of day outcome

- strong states feel more trustworthy
- the system has the start of an audit trail
- the system has the start of a job-based repository

## Day 5: Tighten the Reviewer UI

### Focus

Make the app feel like a real reviewer worksheet.

### Build

- improve row layout and spacing
- show AI subtype / form info clearly
- show cert holder cleanly
- show additional coverage notes as stacked lines
- improve `Review details`
- improve state chips and wording
- make job context visible in the review flow

### End of day outcome

- UI is presentable for a serious walkthrough

## Day 6: End-to-End Sample and Real-Doc Testing

### Focus

Test the workflow across sample docs and your real files.

### Build

- test contract-only mode
- test COI-only mode
- test comparison mode
- test endorsement mismatch cases
- test description-box extra coverage cases
- test job-based grouping assumptions
- list top parsing misses and fix the highest-value ones

### End of day outcome

- you know what works
- you know the remaining weak spots
- biggest review blockers are fixed

## Day 7: Demo/Deploy Prep

### Focus

Get it ready to show or push forward confidently.

### Build

- clean the docs
- clean sample set
- confirm startup flow
- write short tester instructions
- decide what is “pilot-ready next” vs “after demo”
- document security baseline for AWS deployment

### End of day outcome

- coherent repo
- clear next steps
- something you can show without apologizing for the architecture

## Non-Negotiables This Week

Do not let the week drift into:

- random UI churn without parser progress
- adding chatbot features before core review works
- expanding feature scope without tightening the current workflow
- assuming AWS alone solves security

## Daily Rule

Each day, try to complete:

1. one core architecture improvement
2. one visible product improvement
3. one test with a real document or sample

That keeps the system honest.
