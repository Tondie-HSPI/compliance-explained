"use client";

import { ChangeEvent, useMemo, useState } from "react";

type DecisionItem = {
  obligation_type: string;
  requirement: string;
  evidence_requirement?: string | null;
  state: string;
  search_terms: string[];
  source: string;
  evidence_source?: string | null;
  source_excerpt: string;
  explanation: string;
  next_action: string;
};

type AnalysisResponse = {
  workflow_id: string;
  overall_confidence: number;
  analysis_mode: "comparison" | "contract_requirements" | "document_presence";
  items: DecisionItem[];
};

type UploadDocument = {
  document_id: string;
  document_type: string;
  file_name: string;
  file: File;
};

const documentTypeOptions = [
  { value: "contract", label: "Contract" },
  { value: "coi", label: "COI" },
  { value: "policy", label: "Policy" },
  { value: "supporting_doc", label: "Supporting document" }
];

const roleOptions = [
  { value: "contractor", label: "Contractor" },
  { value: "broker", label: "Broker / Agent" },
  { value: "reviewer", label: "Internal reviewer" },
  { value: "admin", label: "Admin" }
];

const apiBaseUrl = "http://localhost:8001";

function displayCoverage(obligationType: string): string {
  return obligationType;
}

function displayState(analysisMode: AnalysisResponse["analysis_mode"] | null, obligationType: string, state: string): string {
  const normalizedObligation = obligationType.toLowerCase();

  if (analysisMode === "contract_requirements") {
    if (state === "missing") {
      return normalizedObligation.includes("waiver of subrogation") ? "not required" : "not required";
    }
    if (state === "met" || state === "needs_review") {
      return "required";
    }
  }

  if (analysisMode === "document_presence") {
    if (state === "met") {
      return "present";
    }
    if (state === "needs_review") {
      return "present";
    }
    if (state === "missing") {
      return "not present";
    }
  }

  if (analysisMode === "comparison") {
    if (state === "met") {
      return "met";
    }
    if (state === "needs_review") {
      return "unmet";
    }
    if (state === "missing") {
      return "missing";
    }
  }

  if (normalizedObligation.includes("waiver of subrogation") && state === "missing") {
    return "not present";
  }
  if (state === "met") {
    return "present";
  }
  if (state === "needs_review") {
    return "review";
  }
  if (state === "missing") {
    return "not present";
  }
  return state.replaceAll("_", " ");
}

function getSummaryLabel(analysisMode: AnalysisResponse["analysis_mode"] | null): string {
  if (analysisMode === "contract_requirements") {
    return "Contract scan";
  }
  if (analysisMode === "document_presence") {
    return "Presence scan";
  }
  if (analysisMode === "comparison") {
    return "Comparison scan";
  }
  return "3-second scan";
}

function stateChip(analysisMode: AnalysisResponse["analysis_mode"] | null, obligationType: string, state: string) {
  const label = displayState(analysisMode, obligationType, state);
  const normalized = label.toLowerCase();

  if (normalized === "met" || normalized === "present" || normalized === "required") {
    return { icon: "✅", label, tone: "good" };
  }
  if (normalized === "unmet" || normalized === "missing" || normalized === "not present" || normalized === "not required") {
    return { icon: "❌", label, tone: "bad" };
  }
  return { icon: "⚠️", label, tone: "warn" };
}

function truncateText(value: string, maxLength = 360): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function formatRequirement(value: string | null | undefined) {
  if (!value) {
    return "No matching evidence";
  }
  return value.split("|").map((part) => part.trim()).filter(Boolean);
}

export default function HomePage() {
  const [accountRole, setAccountRole] = useState("reviewer");
  const [documentType, setDocumentType] = useState("contract");
  const [documents, setDocuments] = useState<UploadDocument[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = useMemo(() => documents.length > 0 && !isSubmitting, [documents.length, isSubmitting]);
  const scanSummary = useMemo(() => {
    const items = analysis?.items ?? [];
    const summary: Record<string, number> = {};

    for (const item of items) {
      const state = displayState(analysis?.analysis_mode ?? null, item.obligation_type, item.state);
      summary[state] = (summary[state] ?? 0) + 1;
    }

    return summary;
  }, [analysis]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) {
      return;
    }

    const timestamp = Date.now();
    const nextDocuments = selectedFiles.map((file, index) => ({
      document_id: `${timestamp}-${index}-${file.name}`,
      document_type: documentType,
      file_name: file.name,
      file
    }));

    setDocuments((current) => [...current, ...nextDocuments]);
    setAnalysis(null);
    setError(null);
    event.target.value = "";
  }

  function removeDocument(documentId: string) {
    setDocuments((current) => current.filter((document) => document.document_id !== documentId));
  }

  function updateDocumentType(documentId: string, nextType: string) {
    setDocuments((current) =>
      current.map((document) =>
        document.document_id === documentId
          ? { ...document, document_type: nextType }
          : document
      )
    );
  }

  async function analyzeDocuments() {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("account_role", accountRole);

      for (const document of documents) {
        formData.append("files", document.file, document.file_name);
        formData.append("document_types", document.document_type);
      }

      const response = await fetch(`${apiBaseUrl}/api/analyze-upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis request failed with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as AnalysisResponse;
      setAnalysis(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while requesting analysis."
      );
      setAnalysis(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Governed Decision Support</p>
        <h1>Unstructured contracts into validated decision states.</h1>
        <p className="lead">
          Compliance Explained models obligations, validates evidence, assigns states,
          and gives users clear next actions without turning the system into a chatbot.
        </p>
      </section>

      <section className="controls">
        <div className="control-grid">
          <label>
            <span>Role</span>
            <select value={accountRole} onChange={(event) => setAccountRole(event.target.value)}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Document type</span>
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="upload-box">
          <strong>Add documents</strong>
          <span>Upload PDF, TXT, or Markdown files for obligation extraction.</span>
          <input type="file" accept=".pdf,.txt,.md,.markdown,.text" multiple onChange={handleFileChange} />
        </label>

        <div className="document-list">
          {documents.length === 0 ? (
            <p className="muted">No documents added yet.</p>
          ) : (
            documents.map((document) => (
              <div className="document-row" key={document.document_id}>
                <div>
                  <strong>{document.file_name}</strong>
                  <label className="inline-select">
                    <span>Type</span>
                    <select
                      value={document.document_type}
                      onChange={(event) => updateDocumentType(document.document_id, event.target.value)}
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="button" onClick={() => removeDocument(document.document_id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <button className="analyze-button" disabled={!canAnalyze} onClick={analyzeDocuments}>
          {isSubmitting ? "Running analysis..." : "Analyze documents"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="summary">
        <div>
          <span>{getSummaryLabel(analysis?.analysis_mode ?? null)}</span>
          <strong>
            {analysis
              ? Object.entries(scanSummary).map(([label, count]) => `${count} ${label}`).join(" | ")
              : "--"}
          </strong>
        </div>
      </section>

      {analysis ? (
        <details className="review-details">
          <summary>Review details</summary>
          <div className="review-details-body">
            <p><strong>Run confidence:</strong> {Math.round(analysis.overall_confidence * 100)}%</p>
            <p><strong>Mode:</strong> {getSummaryLabel(analysis.analysis_mode)}</p>
            <p><strong>Run ID:</strong> {analysis.workflow_id}</p>
          </div>
        </details>
      ) : null}

      <section className="index">
        <div className={`index-head ${analysis?.analysis_mode === "comparison" ? "comparison" : ""}`}>
          <span>Coverage</span>
          <span>{analysis?.analysis_mode === "comparison" ? "Required" : "Requirement"}</span>
          {analysis?.analysis_mode === "comparison" ? <span>Evidence</span> : null}
          <span>State</span>
          <span>Quick search</span>
        </div>

        {(analysis?.items ?? []).map((item) => (
          <details className="index-row" key={`${item.source}-${item.obligation_type}`}>
            <summary className={analysis?.analysis_mode === "comparison" ? "comparison" : ""}>
              <span>{displayCoverage(item.obligation_type)}</span>
              <span>
                {formatRequirement(item.requirement).map((line, index) => (
                  <span className="cell-line" key={`${item.obligation_type}-required-${index}`}>{line}</span>
                ))}
              </span>
              {analysis?.analysis_mode === "comparison" ? (
                <span>
                  {formatRequirement(item.evidence_requirement).map((line, index) => (
                    <span className="cell-line" key={`${item.obligation_type}-evidence-${index}`}>{line}</span>
                  ))}
                </span>
              ) : null}
              <span className={`state-chip ${stateChip(analysis?.analysis_mode ?? null, item.obligation_type, item.state).tone}`}>
                {stateChip(analysis?.analysis_mode ?? null, item.obligation_type, item.state).icon} {stateChip(analysis?.analysis_mode ?? null, item.obligation_type, item.state).label}
              </span>
              <span>{item.search_terms.join(", ")}</span>
            </summary>
            <div className="citation">
              <p><strong>Required source:</strong> {item.source}</p>
              {item.evidence_source ? <p><strong>Evidence source:</strong> {item.evidence_source}</p> : null}
              <p><strong>Why:</strong> {item.explanation}</p>
              <p><strong>Next action:</strong> {item.next_action}</p>
              <p><strong>Citation:</strong> {truncateText(item.source_excerpt)}</p>
            </div>
          </details>
        ))}

        {!analysis ? <p className="muted empty-index">Run an analysis to populate the obligation index.</p> : null}
      </section>
    </main>
  );
}
