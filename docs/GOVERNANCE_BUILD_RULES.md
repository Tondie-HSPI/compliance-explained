# Governance Build Rules

This repo now applies the PDF's core pattern directly:

- guardrails happen before model behavior
- validation happens after outputs are created
- refusal is a controlled business response, not a crash

## Constraint Order

1. Input guardrails
2. Deterministic document and rule checks
3. Retrieved document context
4. LLM interpretation
5. Output validation

## Input Guardrails

The API should refuse requests when:

- no usable documents are uploaded
- too many documents are uploaded at once
- the role is outside supported workflow roles
- the document type is unsupported
- the document content is empty
- the content appears out of scope for compliance review
- the content contains prompt-injection style instructions

Implemented in:

- [constraints.py](C:\Users\tondr\OneDrive\Documents\business_helper_ai\compliance-explained-platform\backend\app\governance\constraints.py)
- [governance.yaml](C:\Users\tondr\OneDrive\Documents\business_helper_ai\compliance-explained-platform\backend\app\rules\governance.yaml)

## Refusal Rules

Refusal is a deliberate system behavior.

The API returns `422` with:

- `error`
- `reason`
- `detail`

This keeps refusal separate from:

- parser failures
- server exceptions
- transport errors

## Output Validation

Every decision item must contain:

- obligation type
- requirement
- state
- search terms
- source
- explanation
- next action

The governance layer also strips or replaces prohibited claims such as:

- legal advice
- guaranteed compliance
- certification-style language

## Why This Matters

For Compliance Explained, AI should help interpret ambiguity, not overrule policy.

That means:

- the system can explain
- the system can summarize
- the system can propose next actions
- the system cannot silently certify compliance

## Next Recommended Rules

- role-based output filtering
- citation-required states for `present`
- refusal when extracted evidence is too weak
- retry loop for malformed LLM output
- audit logging for refusal and validation events
