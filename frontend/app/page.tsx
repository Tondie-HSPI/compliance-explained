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

// --- Style helpers ---
const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  met:          { bg: "#d1fae5", color: "#065f46", label: "Met"          },
  needs_review: { bg: "#fef3c7", color: "#92400e", label: "Needs Review" },
  missing:      { bg: "#fee2e2", color: "#991b1b", label: "Missing"      },
};

const riskStyles: Record<string, { bg: string; color: string; bar: string }> = {
  low:    { bg: "#d1fae5", color: "#065f46", bar: "#10b981" },
  medium: { bg: "#fef3c7", color: "#92400e", bar: "#f59e0b" },
  high:   { bg: "#fee2e2", color: "#991b1b", bar: "#ef4444" },
};

export default function Home() {
  const [file, setFile]       = useState<File | null>(null);
  const [response, setResponse] = useState<ComplianceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>⚖️</div>
          <div>
            <h1 style={styles.title}>Compliance Explained</h1>
            <p style={styles.subtitle}>AI-powered insurance requirement analysis</p>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* ── Upload Card ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Upload Compliance Document</h2>
          <p style={styles.cardSubtitle}>
            Upload a .txt compliance document to extract and analyze insurance requirements.
          </p>

          <div style={styles.uploadRow}>
            <label style={styles.fileLabel}>
              <input
                type="file"
                accept=".txt"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span style={styles.fileButton}>📄 Choose File</span>
              <span style={styles.fileName}>
                {file ? file.name : "No file selected"}
              </span>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                ...styles.uploadButton,
                opacity: !file || loading ? 0.5 : 1,
                cursor: !file || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>

          {loading && (
            <div style={styles.loadingBar}>
              <div style={styles.loadingFill} />
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Results ── */}
        {response && (
          <>
            {/* Escalation Banner */}
            {response.escalation && (
              <div style={styles.escalationBanner}>
                🚨 <strong>Human Review Required</strong> — This document contains
                missing critical coverage or low-confidence extractions that require
                manual verification before proceeding.
              </div>
            )}

            {/* Summary Row */}
            <div style={styles.summaryRow}>
              {/* Risk Score Panel */}
              <div style={{
                ...styles.riskCard,
                background: riskStyles[response.risk_level].bg,
              }}>
                <div style={styles.riskLabel}>Overall Risk Score</div>
                <div style={{
                  ...styles.riskScore,
                  color: riskStyles[response.risk_level].color,
                }}>
                  {response.risk_score}
                  <span style={styles.riskMax}>/100</span>
                </div>
                <div style={styles.riskBarTrack}>
                  <div style={{
                    ...styles.riskBarFill,
                    width: `${response.risk_score}%`,
                    background: riskStyles[response.risk_level].bar,
                  }} />
                </div>
                <div style={{
                  ...styles.riskBadge,
                  background: riskStyles[response.risk_level].bar,
                }}>
                  {response.risk_level.toUpperCase()} RISK
                </div>
              </div>

              {/* Stats */}
              <div style={styles.statsGrid}>
                <StatBox
                  label="Total Requirements"
                  value={response.total}
                  color="#6366f1"
                />
                <StatBox
                  label="Met"
                  value={response.requirements.filter(r => r.status === "met").length}
                  color="#10b981"
                />
                <StatBox
                  label="Needs Review"
                  value={response.requirements.filter(r => r.status === "needs_review").length}
                  color="#f59e0b"
                />
                <StatBox
                  label="Missing"
                  value={response.requirements.filter(r => r.status === "missing").length}
                  color="#ef4444"
                />
              </div>
            </div>

            {/* Requirements Table */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                Requirements — {response.filename}
              </h2>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Coverage Type", "Limit", "Status", "Confidence", "Recommended Action", "Flags"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response.requirements.map((req, i) => {
                      const s = statusStyles[req.status] || statusStyles.needs_review;
                      return (
                        <tr key={i} style={{
                          ...styles.tr,
                          background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                        }}>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{req.type}</td>
                          <td style={styles.td}>{req.limit}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: s.bg,
                              color: s.color,
                            }}>
                              {s.label}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <ConfidenceBar value={req.confidence} />
                          </td>
                          <td style={{ ...styles.td, maxWidth: 240, fontSize: 13 }}>
                            {req.action}
                          </td>
                          <td style={styles.td}>
                            {req.flags.length === 0 ? (
                              <span style={{ color: "#10b981", fontSize: 13 }}>✓ Clean</span>
                            ) : (
                              <ul style={styles.flagList}>
                                {req.flags.map((f, j) => (
                                  <li key={j} style={styles.flagItem}>⚠ {f}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...styles.statBox, borderTop: `4px solid ${color}` }}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={styles.confTrack}>
        <div style={{ ...styles.confFill, width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, color: "#6b7280", minWidth: 32 }}>{value}%</span>
    </div>
  );
}

// --- Styles ---
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: {
    background: "#1e293b",
    padding: "20px 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    maxWidth: 1200,
    margin: "0 auto",
  },
  logo: { fontSize: 36 },
  title: { margin: 0, color: "#f8fafc", fontSize: 24, fontWeight: 700 },
  subtitle: { margin: "2px 0 0", color: "#94a3b8", fontSize: 14 },
  main: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 28,
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTitle: { margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1e293b" },
  cardSubtitle: { margin: "0 0 20px", fontSize: 14, color: "#64748b" },
  uploadRow: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const },
  fileLabel: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  fileButton: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    color: "#334155",
    cursor: "pointer",
  },
  fileName: { fontSize: 14, color: "#64748b" },
  uploadButton: {
    background: "#1e293b",
    color: "#f8fafc",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 15,
    fontWeight: 600,
    transition: "background 0.2s",
  },
  loadingBar: {
    marginTop: 16,
    height: 4,
    background: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  loadingFill: {
    height: "100%",
    width: "40%",
    background: "#6366f1",
    borderRadius: 4,
    animation: "pulse 1.2s ease-in-out infinite",
  },
  errorBanner: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 10,
    padding: "14px 20px",
    marginBottom: 24,
    fontSize: 14,
  },
  escalationBanner: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "2px solid #fed7aa",
    borderRadius: 10,
    padding: "16px 20px",
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 1.6,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 24,
    marginBottom: 24,
  },
  riskCard: {
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  riskLabel: { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 1 },
  riskScore: { fontSize: 52, fontWeight: 800, lineHeight: 1.1, margin: "8px 0" },
  riskMax: { fontSize: 20, fontWeight: 400, color: "#94a3b8" },
  riskBarTrack: { height: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4, margin: "12px 0" },
  riskBarFill: { height: "100%", borderRadius: 4, transition: "width 0.6s ease" },
  riskBadge: {
    display: "inline-block",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    padding: "4px 10px",
    borderRadius: 20,
    marginTop: 4,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  statBox: {
    background: "#fff",
    borderRadius: 10,
    padding: "20px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    textAlign: "center" as const,
  },
  statValue: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 6, fontWeight: 500 },
  tableWrapper: { overflowX: "auto" as const },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th: {
    textAlign: "left" as const,
    padding: "10px 14px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    borderBottom: "2px solid #e2e8f0",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "12px 14px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top" as const,
  },
  tr: { transition: "background 0.1s" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  },
  confTrack: { flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  confFill: { height: "100%", borderRadius: 3, transition: "width 0.4s ease" },
  flagList: { margin: 0, padding: 0, listStyle: "none" },
  flagItem: { fontSize: 12, color: "#b45309", marginBottom: 4, lineHeight: 1.4 },
};