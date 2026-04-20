from typing import Any

from pydantic import BaseModel, Field


class UploadDescriptor(BaseModel):
    document_id: str
    document_type: str
    file_name: str | None = None
    content: str | None = None
    binary_payload: bytes | None = None


class IntakeRequest(BaseModel):
    account_role: str = Field(..., description="contractor, broker, reviewer, or admin")
    documents: list[UploadDescriptor]


class ParsedDocument(BaseModel):
    document_id: str
    document_type: str
    file_name: str | None = None
    markdown: str
    structured_json: dict[str, Any]
    extracted_sections: list[str]
    description_box_lines: list[str] = []
    certificate_holder_text: str | None = None
    matched_keywords: list[str] = []
    failed_matches: list[str] = []


class Obligation(BaseModel):
    obligation_type: str
    document_type: str
    requirement: str
    source: str
    search_terms: list[str]
    confidence: float
    raw_status: str
    dependency: str | None = None
    source_excerpt: str = ""


class ValidationResult(BaseModel):
    obligation_type: str
    matched_evidence: list[str]
    missing_fields: list[str]
    comparison_notes: list[str]


class DecisionItem(BaseModel):
    obligation_type: str
    requirement: str
    evidence_requirement: str | None = None
    state: str
    search_terms: list[str]
    source: str
    evidence_source: str | None = None
    source_excerpt: str
    explanation: str
    next_action: str


class AnalysisResponse(BaseModel):
    workflow_id: str
    overall_confidence: float
    analysis_mode: str
    items: list[DecisionItem]
    parsed_documents: list[ParsedDocument]
    validations: list[ValidationResult]


class AnalysisJob(BaseModel):
    job_id: str
    account_role: str
    documents: list[UploadDescriptor]
    status: str


class JobEnqueueResponse(BaseModel):
    job_id: str
    status: str
