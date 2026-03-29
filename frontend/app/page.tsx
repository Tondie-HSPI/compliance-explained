"use client";
import { useState } from "react";

// --- Types ---
interface Requirement {
  type: string;
  limit: string;
  status: "met" | "needs_review" | "missing";
  confidence: number;
  flags: string[];
  action: string;
}

interface ComplianceResponse {
  filename: string;
  requirements: Requirement[];
  total: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  escalation?: string;
  preview: string;
}

// --- Styles ---
const statusStyles = {
  met: { bg: "#d1fae5", color: "#065f46", label: "Met" },
  needs_review: { bg: "#fef3c7", color: "#92400e", label: "Needs Review" },
  missing: { bg: "#fee2e2", color: "#991b1b", label: "Missing" },
};

const riskStyles = {
  low: { bg: "#d1fae5", color: "#065f46", bar: "#10b981" },
  medium: { bg: "#fef3c7", color: "#92400e", bar: "#f59e0b" },
  high: { bg: "#fee2e2", color: "#991b1b", bar: "#ef4444" },
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<ComplianceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Compliance Explained</h1>

      {/* Upload */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Upload"}
      </button>

      {!response && !loading && (
        <p style={{ marginTop: 20 }}>
          Upload a document to begin analysis
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {response && (
        <>
          {/* Escalation */}
          {response.escalation && (
            <div style={{ background: "#ffe0e0", padding: 10, marginTop: 20 }}>
              🚨 Human review required
            </div>
          )}

          {/* Summary */}
          <div style={{ marginTop: 20, padding: 10, background: "#eee" }}>
            <strong>Summary:</strong>{" "}
            {response.risk_level === "high"
              ? "High compliance risk. Immediate action required."
              : response.risk_level === "medium"
              ? "Moderate risk. Review flagged items."
              : "Low risk. Looks compliant."}
          </div>

          {/* Risk Panel */}
          <div
            style={{
              marginTop: 20,
              padding: 20,
              background: riskStyles[response.risk_level].bg,
            }}
          >
            <h2>Risk Score: {response.risk_score}</h2>
            <p>{response.risk_level.toUpperCase()}</p>
          </div>

          {/* Table */}
          <table style={{ marginTop: 20, width: "100%" }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Limit</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Action</th>
                <th>Flags</th>
              </tr>
            </thead>

            <tbody>
              {[...response.requirements]
                .sort((a, b) => {
                  const order = { missing: 0, needs_review: 1, met: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((req, i) => {
                  const s = statusStyles[req.status];

                  return (
                    <tr key={i}>
                      <td>{req.type}</td>
                      <td>{req.limit}</td>

                      <td style={{ color: s.color }}>
                        {s.label}
                      </td>

                      <td>{req.confidence}%</td>

                      <td>{req.action}</td>

                      <td>
                        {req.flags.length === 0
                          ? "✓ Clean"
                          : req.flags.join(", ")}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}