# Sample Pack

These files are designed to exercise the main review modes in the unified app.

## Contract-only mode

Upload:

- `contract-required-full.txt`

Expected language:

- `required`
- `not required`

## Evidence-only mode

Upload one of:

- `coi-present-strong.txt`
- `policy-present-strong.txt`
- `coi-missing-wos.txt`

Expected language:

- `present`
- `not present`

## Comparison mode

### Strong match

Upload together:

- `contract-required-full.txt`
- `coi-present-strong.txt`

Expected comparison language:

- `met`
- `missing`

### Mixed / unmet

Upload together:

- `contract-required-full.txt`
- `coi-unmet-limits.txt`

Expected comparison language:

- `unmet`
- `missing`

### Policy-backed comparison

Upload together:

- `contract-required-full.txt`
- `policy-present-strong.txt`

Expected comparison language:

- `met`
- `missing`

## What each file is testing

- `contract-required-full.txt`
  - GL required
  - AI required for owner, contractor
  - WOS required for owner, contractor
  - Umbrella required

- `contract-no-wos.txt`
  - WOS not required

- `coi-present-strong.txt`
  - GL present
  - AI present
  - Umbrella present
  - no WOS evidence

- `coi-unmet-limits.txt`
  - GL present but lower than contract requirement
  - AI present only for owner
  - Umbrella present but lower than contract requirement

- `policy-present-strong.txt`
  - policy/endorsement-style evidence with strong matches

- `coi-missing-wos.txt`
  - useful for `present / not present` testing
