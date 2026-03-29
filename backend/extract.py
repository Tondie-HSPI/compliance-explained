import os
import json
import openai
from dotenv import load_dotenv

# Load environment variables from .env so OPENAI_API_KEY
# is available without hardcoding credentials
load_dotenv()

# Initialize the OpenAI client once at module level
# so it's reused across requests rather than recreated each time
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# The system prompt defines the LLM's role, output schema, and rules.
# Keeping it here (not inside the function) makes it easy to version
# and update independently of the calling logic.
SYSTEM_PROMPT = """You are a compliance document analyst. Your job is to extract insurance and compliance requirements from documents.

You MUST respond ONLY with valid JSON — no explanation, no markdown, no preamble.

Return this exact structure:
{
  "requirements": [
    {
      "type": "string (e.g. General Liability, Workers Comp, Auto Liability)",
      "limit": "string (e.g. $1,000,000 or 'not specified')",
      "status": "met | needs_review | missing",
      "confidence": integer between 0 and 100
    }
  ]
}

Rules:
- Extract every insurance or compliance requirement you find.
- If a limit is not explicitly stated, set limit to "not specified".
- Set status to "needs_review" when the limit is ambiguous or partially stated.
- Set status to "missing" only if the requirement is referenced but no details exist.
- Set status to "met" only if the requirement is clearly and fully described.
- Confidence reflects how clearly the requirement was stated in the document (0–100).
- Do NOT invent requirements not present in the document.
"""


def extract_requirements(text: str) -> dict:
    """
    Sends document text to the LLM and returns extracted requirements.

    Flow:
        1. Call OpenAI with the system prompt + document text
        2. Parse the JSON response into a Python dict
        3. Normalize the result if the expected key is missing
        4. Return { "requirements": [ {...}, ... ] } to the caller

    This function is a pure extraction layer — no validation or
    business logic lives here. It only does language reasoning.

    Raises:
        ValueError  — if the LLM returns malformed JSON (caller → HTTP 422)
        RuntimeError — if the OpenAI API itself fails (caller → HTTP 502)
    """

    try:
        # temperature=0 keeps output deterministic — critical for structured data
        # response_format json_object enforces JSON at the API level, not just via prompting
        # text is truncated to 12,000 chars to stay within safe context window limits
        response = client.chat.completions.create(
            model="gpt-4o",
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Extract all compliance requirements from this document:\n\n{text[:12000]}"
                },
            ],
        )

        # The model's reply is a raw JSON string inside the message content
        raw = response.choices[0].message.content

        # Parse into a Python dict — can fail if the model misbehaves despite json_object mode
        parsed = json.loads(raw)

        # If the model returned valid JSON but used a different top-level key,
        # normalize it rather than letting bad structure propagate downstream
        if "requirements" not in parsed:
            parsed = {"requirements": []}

        return parsed

    except json.JSONDecodeError as e:
        # Surface this clearly so main.py can return the right HTTP status
        raise ValueError(f"LLM returned invalid JSON: {e}")

    except openai.OpenAIError as e:
        # Covers network failures, auth errors, quota issues, etc.
        raise RuntimeError(f"OpenAI API error: {e}")