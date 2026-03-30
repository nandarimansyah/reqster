import { useState } from "react";
import { HttpResponseData } from "../types";

type ResponseTab = "body" | "headers";

interface ResponsePanelProps {
  response: HttpResponseData | null;
  loading: boolean;
  error: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "var(--status-success)";
  if (status >= 300 && status < 400) return "var(--status-redirect)";
  if (status >= 400 && status < 500) return "var(--status-client-error)";
  if (status >= 500) return "var(--status-server-error)";
  return "var(--text-secondary)";
}

function tryPrettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function ResponsePanel({ response, loading, error }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>("body");
  const [copied, setCopied] = useState(false);

  const copyBody = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <section className="response-panel response-empty">
        <div className="loading-spinner" aria-label="Sending request…" />
        <p>Sending request…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="response-panel response-empty">
        <p className="error-message">{error}</p>
      </section>
    );
  }

  if (!response) {
    return (
      <section className="response-panel response-empty">
        <p className="placeholder-text">
          Enter a URL above and click <strong>Send</strong>.
        </p>
      </section>
    );
  }

  const prettyBody = tryPrettyJson(response.body);
  const isJson = prettyBody !== response.body;

  return (
    <section className="response-panel">
      {/* Status bar */}
      <div className="response-status-bar">
        <span
          className="status-badge"
          style={{ color: statusColor(response.status) }}
        >
          {response.status} {response.status_text}
        </span>
        <span className="response-meta">{response.duration_ms} ms</span>
        <span className="response-meta">{formatBytes(response.size_bytes)}</span>

        <div style={{ marginLeft: "auto" }}>
          <button className="btn-text" onClick={copyBody} title="Copy body">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "body" ? "active" : ""}`}
          onClick={() => setActiveTab("body")}
        >
          Body
        </button>
        <button
          className={`tab ${activeTab === "headers" ? "active" : ""}`}
          onClick={() => setActiveTab("headers")}
        >
          Headers ({response.headers.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content response-body-container">
        {activeTab === "body" && (
          <pre className={`response-body ${isJson ? "json" : ""}`}>
            {prettyBody}
          </pre>
        )}

        {activeTab === "headers" && (
          <table className="headers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {response.headers.map((h, i) => (
                <tr key={i}>
                  <td className="header-key">{h.key}</td>
                  <td className="header-value">{h.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
