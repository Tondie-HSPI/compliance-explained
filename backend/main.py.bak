# FastAPI entry point
#
# Request flow:
#   Frontend → Next.js /api/upload proxy → here → extract.py (LLM) → validate → response
#
# Application layer responsibilities (all deterministic — no LLM):
#   1. Normalize requirement type names (handles LLM variations)
#   2. Validate extracted requirements against business rules
#   3. Detect required coverage types that are absent from the document
#   4. Attach a recommended action to each requirement
#   5. Calculate an overall risk score and risk level
#   6. Determine whether the case needs human escalation

from fastapi import FastAPI, UploadFile, File, HTTPException
from extract import extract_requirements

app = FastAPI()

# ---------------------------------------------------------------------------
# Constants — single source of truth for all business rules
# ---------------------------------------------------------------------------

REQUIRED_COVERAGE_TYPES = {
    "General Liability",
    "Workers Comp",
    "Auto Liability",
    "Professional Liability",
    "Umbrella",
    "Cyber Liability",
}

KNOWN_TYPES = REQUIRED_COVERAGE_TYPES

CONFIDENCE_REVIEW_THRESHOLD = 75
CONFIDENCE_ESCALATION_THRESHOLD = 60

STATUS_RISK_POINTS = {
    "missing": 30,
    "needs_review": 15,
    "met": 0,
}

RISK_POINTS_PER_FLAG = 5

RISK_LEVEL_THRESHOLDS = {
    "high": 60,
    "medium": 30,
}

# ---------------------------------------------------------------------------
# Type normalization map
# Maps common LLM variations → canonical type names
# Add entries here as new variations are discovered
# ---------------------------------------------------------------------------

TYPE_ALIASES = {
    # Workers Comp variations
    "workers compensation":         "Workers Comp",
    "workers' compensation":        "Workers Comp",
    "workers comp":                 "Workers Comp",
    "workman's comp":               "Workers Comp",
    "workmen's compensation":       "Workers Comp",
    # General Liability variations
    "general liability":            "General Liability",
    "gl":                           "General Liability",
    "commercial general liability": "General Liability",
    "cgl":                          "General Liability",
    # Auto Liability variations
    "auto liability":               "Auto Liability",
    "automobile liability":         "Auto Liability",
    "commercial auto":              "Auto Liability",
    "vehicle liability":            "Auto Liability",
    # Professional Liability variations
    "professional liability":       "Professional Liability",
    "errors and omissions":         "Professional Liability",
    "e&o":                          "Professional Liability",
    "professional indemnity":       "Professional Liability",
    # Umbrella variations
    "umbrella":                     "Umbrella",
    "umbrella liability":           "Umbrella",
    "excess liability":             "Umbrella",
    # Cyber Liability variations
    "cyber liability":              "Cyber Liability",
    "cyber insurance":              "Cyber Liability",
    "cyber risk":                   "Cyber Liability",
    "data breach":                  "Cyber Liability",
}

# ---------------------------------------------------------------------------
# Action recommendation map
# ---------------------------------------------------------------------------

STATUS_DEFAULT_ACTIONS = {
    "missing":      "Obtain certificate of insurance for this coverage type",
    "needs_review": "Confirm details with the carrier or request updated documentation",
    "met":          "No action required — retain documentation on file",
}

TYPE_SPECIFIC_ACTIONS = {
    ("General Liability",     "missing"):      "Request COI showing General Liability coverage immediately",
    ("General Liability",     "needs_review"): "Confirm per-occurrence and aggregate limits with carrier",
    ("Workers Comp",          "missing"):      "Verify state requirement and obtain Workers Comp policy",
    ("Workers Comp",          "needs_review"): "Confirm policy covers all employee classifications",
    ("Auto Liability",        "missing"):      "Request Auto Liability COI if any vehicle use is involved",
    ("Auto Liability",        "needs_review"): "Clarify whether coverage applies to hired/non-owned vehicles",
    ("Professional Liability","missing"):      "Determine if professional services trigger this requirement",
    ("Cyber Liability",       "missing"):      "Assess data handling scope — Cyber Liability may be mandatory",
    ("Cyber Liability",       "needs_review"): "Confirm coverage includes first-party and third-party claims",
    ("Umbrella",              "needs_review"): "Verify umbrella limit meets contract minimums",
}


# ---------------------------------------------------------------------------
# Helper: normalize_type
# ---------------------------------------------------------------------------

def normalize_type(raw_type: str) -> str:
    """
    Converts LLM-generated type strings to canonical names.
    Lowercases and strips whitespace before lookup so matching
    is case-insensitive. Returns the original string unchanged
    if no alias is found — unknown types are caught by validation.
    """
    return TYPE_ALIASES.get(raw_type.strip().lower(), raw_type.strip())


# ---------------------------------------------------------------------------
# Helper: normalize_requirements
# ---------------------------------------------------------------------------

def normalize_requirements(requirements: list[dict]) -> list[dict]:
    """
    Runs each requirement's type through the alias map.
    Called before deduplication and missing detection so that
    'Workers Compensation' and 'Workers Comp' collapse into one entry.
    """
    for req in requirements:
        req["type"] = normalize_type(req.get("type", ""))
    return requirements


# ---------------------------------------------------------------------------
# Helper: deduplicate_requirements
# ---------------------------------------------------------------------------

def deduplicate_requirements(requirements: list[dict]) -> list[dict]:
    """
    After normalization, multiple LLM entries may share the same type.
    Keep the one with the highest confidence — it's most likely the best extraction.
    """
    seen = {}
    for req in requirements:
        req_type = req.get("type")
        if req_type not in seen:
            seen[req_type] = req
        else:
            # Replace if this entry has higher confidence
            if req.get("confidence", 0) > seen[req_type].get("confidence", 0):
                seen[req_type] = req
    return list(seen.values())


# ---------------------------------------------------------------------------
# Helper: recommend_action
# ---------------------------------------------------------------------------

def recommend_action(req_type: str, status: str) -> str:
    return TYPE_SPECIFIC_ACTIONS.get(
        (req_type, status),
        STATUS_DEFAULT_ACTIONS.get(status, "Review this requirement manually")
    )


# ---------------------------------------------------------------------------
# Helper: detect_missing_requirements
# ---------------------------------------------------------------------------

def detect_missing_requirements(requirements: list[dict]) -> list[dict]:
    """
    Injects a 'missing' record for any required coverage type
    not present after normalization and deduplication.
    """
    found_types = {req.get("type") for req in requirements}
    missing = []
    for coverage_type in REQUIRED_COVERAGE_TYPES:
        if coverage_type not in found_types:
            missing.append({
                "type": coverage_type,
                "limit": "not specified",
                "status": "missing",
                "confidence": 100,
            })
    return requirements + missing


# ---------------------------------------------------------------------------
# Helper: calculate_risk
# ---------------------------------------------------------------------------

def calculate_risk(requirements: list[dict]) -> dict:
    if not requirements:
        return {"risk_score": 0, "risk_level": "low"}

    raw_score = 0
    for req in requirements:
        raw_score += STATUS_RISK_POINTS.get(req.get("status", "needs_review"), 15)
        raw_score += len(req.get("flags", [])) * RISK_POINTS_PER_FLAG

    max_possible = len(requirements) * (STATUS_RISK_POINTS["missing"] + 2 * RISK_POINTS_PER_FLAG)
    normalized = int((raw_score / max_possible) * 100) if max_possible > 0 else 0
    risk_score = min(normalized, 100)

    if risk_score >= RISK_LEVEL_THRESHOLDS["high"]:
        risk_level = "high"
    elif risk_score >= RISK_LEVEL_THRESHOLDS["medium"]:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {"risk_score": risk_score, "risk_level": risk_level}


# ---------------------------------------------------------------------------
# Helper: determine_escalation
# ---------------------------------------------------------------------------

def determine_escalation(requirements: list[dict]) -> str | None:
    critical_missing = {req["type"] for req in requirements if req.get("status") == "missing"}
    low_confidence = any(
        req.get("confidence", 100) < CONFIDENCE_ESCALATION_THRESHOLD
        for req in requirements
    )
    if critical_missing or low_confidence:
        return "human_review_required"
    return None


# ---------------------------------------------------------------------------
# Core: validate_requirements
# ---------------------------------------------------------------------------

def validate_requirements(requirements: list[dict]) -> list[dict]:
    """
    Applies deterministic business rules to each requirement.
    By this point types are already normalized and deduplicated.
    """
    for req in requirements:
        flags = []

        if req.get("type") not in KNOWN_TYPES:
            flags.append(f"Unrecognized requirement type: '{req.get('type')}'")

        if req.get("confidence", 0) < CONFIDENCE_REVIEW_THRESHOLD:
            flags.append("Low confidence — human review recommended")
            req["status"] = "needs_review"

        if req.get("limit") in ("not specified", None, ""):
            flags.append("Limit not specified in document")
            if req["status"] == "met":
                req["status"] = "needs_review"

        req["action"] = recommend_action(req.get("type", ""), req.get("status", "needs_review"))
        req["flags"] = flags

    return requirements


# ---------------------------------------------------------------------------
# Route: /upload
# ---------------------------------------------------------------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Full pipeline for a single compliance document upload.

    Steps:
        1. Read and decode the file
        2. Guard against empty input
        3. Extract requirements via LLM
        4. Normalize type names (fixes LLM variations)
        5. Deduplicate (collapses normalized duplicates)
        6. Inject missing required coverage types
        7. Validate with deterministic rules
        8. Calculate risk score
        9. Determine escalation
        10. Return structured response
    """

    contents = await file.read()
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        extracted = extract_requirements(text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Normalize → deduplicate → detect missing → validate
    requirements = normalize_requirements(extracted.get("requirements", []))
    requirements = deduplicate_requirements(requirements)
    requirements = detect_missing_requirements(requirements)
    validated = validate_requirements(requirements)

    risk = calculate_risk(validated)
    escalation = determine_escalation(validated)

    response = {
        "filename": file.filename,
        "requirements": validated,
        "total": len(validated),
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "preview": text[:300],
    }

    if escalation:
        response["escalation"] = escalation

    return response