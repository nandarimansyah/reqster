import { useState } from "react";
import { BodyType, HttpMethod, HttpRequest, KeyValuePair } from "../types";

type RequestTab = "params" | "headers" | "body" | "auth";

interface RequestPanelProps {
  request: HttpRequest;
  loading: boolean;
  onChange: (updated: HttpRequest) => void;
  onSend: () => void;
}

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

function newPair(): KeyValuePair {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

function KeyValueEditor({
  pairs,
  onChange,
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}) {
  const update = (id: string, field: keyof KeyValuePair, val: string | boolean) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const remove = (id: string) => onChange(pairs.filter((p) => p.id !== id));

  const addRow = () => onChange([...pairs, newPair()]);

  return (
    <div className="kv-editor">
      {pairs.map((p) => (
        <div key={p.id} className="kv-row">
          <input
            type="checkbox"
            checked={p.enabled}
            onChange={(e) => update(p.id, "enabled", e.target.checked)}
            aria-label="Enable"
          />
          <input
            className="kv-input"
            placeholder="Key"
            value={p.key}
            onChange={(e) => update(p.id, "key", e.target.value)}
          />
          <input
            className="kv-input"
            placeholder="Value"
            value={p.value}
            onChange={(e) => update(p.id, "value", e.target.value)}
          />
          <button
            className="btn-icon btn-danger"
            onClick={() => remove(p.id)}
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button className="btn-text" onClick={addRow}>
        + Add row
      </button>
    </div>
  );
}

export function RequestPanel({
  request,
  loading,
  onChange,
  onSend,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>("params");

  const set = <K extends keyof HttpRequest>(key: K, value: HttpRequest[K]) =>
    onChange({ ...request, [key]: value });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSend();
  };

  const tabs: RequestTab[] = ["params", "headers", "body", "auth"];

  const activeParamCount = request.queryParams.filter(
    (p) => p.enabled && p.key.trim()
  ).length;
  const activeHeaderCount = request.headers.filter(
    (h) => h.enabled && h.key.trim()
  ).length;

  const tabLabel = (tab: RequestTab) => {
    if (tab === "params" && activeParamCount > 0)
      return `Params (${activeParamCount})`;
    if (tab === "headers" && activeHeaderCount > 0)
      return `Headers (${activeHeaderCount})`;
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  return (
    <section className="request-panel">
      {/* URL bar */}
      <div className="url-bar">
        <select
          className="method-select"
          value={request.method}
          onChange={(e) => set("method", e.target.value as HttpMethod)}
          aria-label="HTTP Method"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          className="url-input"
          type="url"
          placeholder="https://api.example.com/endpoint"
          value={request.url}
          onChange={(e) => set("url", e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Request URL"
        />

        <button
          className="btn-send"
          onClick={onSend}
          disabled={loading || !request.url.trim()}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === "params" && (
          <KeyValueEditor
            pairs={request.queryParams}
            onChange={(pairs) => set("queryParams", pairs)}
          />
        )}

        {activeTab === "headers" && (
          <KeyValueEditor
            pairs={request.headers}
            onChange={(pairs) => set("headers", pairs)}
          />
        )}

        {activeTab === "body" && (
          <div className="body-editor">
            <div className="body-type-row">
              {(["none", "json", "text", "form-urlencoded"] as BodyType[]).map(
                (t) => (
                  <label key={t} className="body-type-option">
                    <input
                      type="radio"
                      name="body-type"
                      value={t}
                      checked={request.body.type === t}
                      onChange={() =>
                        set("body", { ...request.body, type: t })
                      }
                    />
                    {t}
                  </label>
                )
              )}
            </div>

            {request.body.type !== "none" && (
              <textarea
                className="body-textarea"
                placeholder={
                  request.body.type === "json"
                    ? '{\n  "key": "value"\n}'
                    : "Request body…"
                }
                value={request.body.content}
                onChange={(e) =>
                  set("body", { ...request.body, content: e.target.value })
                }
                spellCheck={false}
              />
            )}
          </div>
        )}

        {activeTab === "auth" && (
          <div className="auth-placeholder">
            <p className="placeholder-text">
              Authentication options will appear here.
              <br />
              Supported: API Key, Bearer Token, Basic Auth.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
