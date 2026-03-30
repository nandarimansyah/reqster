import { Collection, HttpMethod, HttpRequest } from "../types";

interface SidebarProps {
  collections: Collection[];
  activeRequestId: string | null;
  onSelectRequest: (request: HttpRequest) => void;
  onNewRequest: () => void;
}

function methodBadge(method: HttpMethod) {
  const colors: Record<HttpMethod, string> = {
    GET: "var(--method-get)",
    POST: "var(--method-post)",
    PUT: "var(--method-put)",
    PATCH: "var(--method-patch)",
    DELETE: "var(--method-delete)",
    HEAD: "var(--method-head)",
    OPTIONS: "var(--method-options)",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        color: colors[method],
        minWidth: "44px",
        display: "inline-block",
      }}
    >
      {method}
    </span>
  );
}

export function Sidebar({
  collections,
  activeRequestId,
  onSelectRequest,
  onNewRequest,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Collections</span>
        <button
          className="btn-icon"
          onClick={onNewRequest}
          title="New Request"
          aria-label="New Request"
        >
          +
        </button>
      </div>

      <div className="sidebar-body">
        {collections.length === 0 && (
          <p className="sidebar-empty">
            No collections yet.
            <br />
            Click <strong>+</strong> to start.
          </p>
        )}

        {collections.map((col) => (
          <div key={col.id} className="collection">
            <div className="collection-name">{col.name}</div>
            {col.requests.map((req) => (
              <button
                key={req.id}
                className={`request-item ${activeRequestId === req.id ? "active" : ""}`}
                onClick={() => onSelectRequest(req)}
              >
                {methodBadge(req.method)}
                <span className="request-name">{req.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
