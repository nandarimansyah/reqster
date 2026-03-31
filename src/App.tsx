import { useState } from "react";
import { Collection, HttpRequest } from "./types";
import { Sidebar } from "./components/Sidebar";
import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { useRequest } from "./hooks/useRequest";

function defaultRequest(): HttpRequest {
  return {
    id: crypto.randomUUID(),
    name: "Untitled request",
    method: "GET",
    url: "",
    queryParams: [],
    headers: [],
    body: { type: "none", content: "" },
  };
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [collections] = useState<Collection[]>([]);
  const [request, setRequest] = useState<HttpRequest>(defaultRequest());
  const { response, loading, error, sendRequest } = useRequest();

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleNewRequest = () => setRequest(defaultRequest());

  const handleSelectRequest = (req: HttpRequest) => setRequest({ ...req });

  return (
    <div className="app-layout">
      {/* Top bar */}
      <header className="app-header">
        <span className="app-logo">Reqster</span>
        <div className="app-header-actions">
          <button
            className="btn-text"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "Dark" : "Light"} mode
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="app-body">
        <Sidebar
          collections={collections}
          activeRequestId={request.id}
          onSelectRequest={handleSelectRequest}
          onNewRequest={handleNewRequest}
        />

        <main className="main-area">
          <RequestPanel
            request={request}
            loading={loading}
            onChange={setRequest}
            onSend={() => sendRequest(request)}
          />

          <div className="divider" />

          <ResponsePanel response={response} loading={loading} error={error} />
        </main>
      </div>
    </div>
  );
}
