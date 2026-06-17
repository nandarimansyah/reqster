# Reqster — Architecture

## 1. Overview

Reqster is an **open-source, cross-platform desktop API client** built with
**Tauri v2**. The frontend is a React + TypeScript SPA rendered in a webview,
and the backend is a Rust binary that handles HTTP requests, local storage, and
OS-level operations. IPC (inter-process communication) flows through Tauri's
`invoke` mechanism.

**Goal:** A fast, lightweight, local-first alternative to Postman / Insomnia
with no accounts, no cloud sync, and a minimal resource footprint.

---

## 2. Technology Stack

| Layer       | Technology                                      | Role                          |
|-------------|-------------------------------------------------|-------------------------------|
| Shell       | [Tauri v2](https://v2.tauri.app)                | Window, native menus, dialogs |
| Frontend    | React 18 + TypeScript + Vite 5                  | UI rendering, user interaction|
| Backend     | Rust (edition 2021)                             | HTTP engine, storage, auth    |
| HTTP Client | [reqwest 0.12](https://docs.rs/reqwest)         | Send HTTP requests            |
| Bundler     | [Vite 5](https://vitejs.dev)                    | Dev server, production build  |

**Planned additions (phases 0–5):**

- `rusqlite` or `tauri-plugin-sql` — local persistence
- `tauri-plugin-dialog` — native save dialogs
- `tauri-plugin-clipboard` — clipboard access (if needed beyond Web API)
- `serde` / `serde_json` (already present) — serialisation

---

## 3. Directory Structure

```
reqster/
├── ARCHITECTURE.md          # This file
├── plan.md                  # Requirements & development roadmap
├── CONTRIBUTING.md          # Contributor guide
├── README.md                # Project overview, getting started
├── package.json             # Node dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite / Tauri dev server config
├── index.html               # Vite entry HTML
│
├── src/                     # ── Frontend (React + TypeScript) ──
│   ├── main.tsx             # React DOM entry point
│   ├── App.tsx              # Root component, layout, global state
│   ├── index.css            # All styles (CSS variables, layouts, components)
│   │
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces & types
│   │
│   ├── components/
│   │   ├── Sidebar.tsx      # Collections / requests tree
│   │   ├── RequestPanel.tsx # URL bar, method, tabs (params/headers/body/auth)
│   │   └── ResponsePanel.tsx# Status bar, body/headers views
│   │
│   └── hooks/
│       └── useRequest.ts    # Invoke send_request, manage loading/error/response
│
└── src-tauri/               # ── Backend (Rust) ──
    ├── Cargo.toml           # Rust dependencies
    ├── Cargo.lock           # Dependency lockfile
    ├── build.rs             # Tauri build script
    ├── tauri.conf.json      # Window config, app metadata, build commands
    │
    ├── capabilities/
    │   └── default.json     # Tauri v2 capability permissions
    │
    ├── icons/
    │   └── icon.png         # App icon
    │
    └── src/
        ├── main.rs          # Windows subsystem entry point
        ├── lib.rs           # Tauri app builder, command registration
        └── commands.rs      # send_request command (HTTP via reqwest)
```

---

## 4. Frontend Architecture

### 4.1 Component Tree

```
<App>
  ├── header .app-header
  │   ├── logo ("Reqster")
  │   └── theme toggle button
  │
  └── div .app-body
      ├── <Sidebar>
      │   ├── sidebar header (title + "+" button)
      │   └── sidebar body
      │       ├── collection (repeated)
      │       │   ├── collection name
      │       │   └── request items (repeated)
      │       │       ├── method badge (colored)
      │       │       └── request name
      │       └── empty state (when no collections)
      │
      └── main .main-area
          ├── divider / split
          │
          ├── <RequestPanel>
          │   ├── URL bar
          │   │   ├── method <select>
          │   │   ├── URL <input>
          │   │   └── Send <button>
          │   ├── tabs (params | headers | body | auth)
          │   └── tab content
          │       ├── params → <KeyValueEditor>
          │       ├── headers → <KeyValueEditor>
          │       ├── body → radio + <textarea>
          │       └── auth → placeholder (to be implemented)
          │
          └── <ResponsePanel>
              ├── status bar (status code, duration, size, copy)
              ├── tabs (body | headers)
              └── tab content
                  ├── body → <pre> (raw or pretty-printed JSON)
                  └── headers → <table>
```

### 4.2 Data Flow

```
User action → Component state update → Re-render
                  │
                  ▼
         useRequest.sendRequest()
                  │
                  ▼
         invoke<T>("send_request", { method, url, headers, body })
                  │
                  ▼
         Tauri IPC bridge (JSON serialised)
                  │
                  ▼
         Rust commands::send_request()
                  │
                  ▼
         reqwest::Client sends HTTP
                  │
                  ▼
         HttpResponse returned to frontend
                  │
                  ▼
         setResponse(data) → ResponsePanel re-renders
```

### 4.3 State Management

Currently **no external state library**. State is managed with React `useState`
and `useCallback` (via hooks). The root `App` component owns all canonical
state and passes it down as props:

| State                  | Owner    | Type                      |
|------------------------|----------|---------------------------|
| `collections`          | App      | `Collection[]`            |
| `request` (active)     | App      | `HttpRequest`             |
| `response`             | useRequest| `HttpResponseData \| null`|
| `loading`              | useRequest| `boolean`                 |
| `error`                | useRequest| `string \| null`          |
| `theme`                | App      | `"light" \| "dark"`       |

**Planned evolution:**

- Phase 0 will introduce a **storage layer** (SQLite) that replaces the
  in-memory `collections` array with a persisted one, loaded via Tauri commands.
- A lightweight context or zustand store may be introduced if prop drilling
  becomes unwieldy, but for v0.x the simple prop-passing approach is sufficient.

### 4.4 Reusable Components

**`KeyValueEditor`** (internal to `RequestPanel`):

- Renders a list of key-value rows (id, checkbox, key input, value input,
  delete button)
- Used for both query params and headers
- Controlled by parent via `pairs` and `onChange`

---

## 5. Backend Architecture (Rust)

### 5.1 Crate Structure

The Rust code is organised as a **single crate** (`reqster_lib`) with a
`cdylib` + `rlib` output for Tauri:

```
src-tauri/src/
├── main.rs         # #![windows_subsystem] entry — calls reqster_lib::run()
├── lib.rs          # Tauri::Builder setup, registers commands
└── commands.rs     # Tauri command functions
```

### 5.2 Module Responsibilities

**`lib.rs` — App Initialisation**

```rust
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::send_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Registered commands: `send_request`

**`commands.rs` — HTTP Engine**

| Function       | Visibility | Purpose                                     |
|----------------|------------|---------------------------------------------|
| `send_request` | `pub`      | Tauri command. Builds reqwest request,      |
|                |            | sends it, returns `HttpResponse`.           |

Key design decisions:

- `reqwest::Client` is created per-request (not pooled) for simplicity.
  A pooled `Client` (static or lazy) can be introduced when performance
  demands it.
- Request body is sent as a raw string; Content-Type should be set by the
  user in headers (or auto-inferred later).
- Response body is collected eagerly as bytes, then converted to `String`
  via `String::from_utf8_lossy` to handle non-UTF-8 gracefully.
- Duration is measured with `std::time::Instant`.
- All errors are surfaced to the frontend as `Result<HttpResponse, String>`.

**Future modules (planned):**

| Module        | Contents                                       |
|---------------|------------------------------------------------|
| `storage.rs`  | SQLite connection pool, CRUD operations        |
| `env.rs`      | Environment variable resolution (`{{var}}`)    |
| `auth.rs`     | Auth header injection (API Key, Bearer, Basic) |
| `export.rs`   | Collection export (Postman, cURL, Reqster fmt) |
| `import.rs`   | Collection import from Postman / Insomnia      |

### 5.3 Data Structures

```rust
// From the frontend
#[derive(Debug, Deserialize)]
pub struct HttpHeader {
    pub key: String,
    pub value: String,
}

// Returned to the frontend
#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<HttpHeader>,
    pub body: String,
    pub duration_ms: u64,
    pub size_bytes: usize,
}
```

Serde `#[serde(rename_all = "camelCase")]` is **not** used — the Rust struct
fields are snake_case and the TypeScript interface (`HttpResponseData`) mirrors
them as-is. Tauri's IPC serialisation converts them automatically.

---

## 6. IPC Communication

### 6.1 Tauri `invoke`

The frontend sends commands to the backend via `@tauri-apps/api/core` `invoke`:

```ts
// Frontend (useRequest.ts)
const result = await invoke<HttpResponseData>("send_request", {
  method: request.method,
  url,
  headers: activeHeaders,
  body,  // string | null
});
```

The Rust side declares:

```rust
#[tauri::command]
pub async fn send_request(
    method: String,
    url: String,
    headers: Vec<HttpHeader>,
    body: Option<String>,
) -> Result<HttpResponse, String> { ... }
```

**Key rules:**

- Parameter names in the TS object must match Rust function parameter names
  exactly (they are serialised to a JSON map, then deserialised).
- Return value is serialised to JSON by Tauri and deserialised by the generic
  type parameter on the TS side.
- Commands are registered in `lib.rs` via `generate_handler![]`.

### 6.2 Capabilities (Tauri v2)

Defined in `src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

This grants the main window the default core permissions. As new features
are added (save file dialog, clipboard, SQL plugin), new capabilities will
be added here.

---

## 7. CSS Architecture

### 7.1 Strategy

- **Single CSS file** (`src/index.css`) — no CSS modules, no Tailwind.
  Acceptable for the current scope; may be split into smaller files if
  styles exceed ~1000 lines.
- **CSS custom properties** for theming (light/dark).
- **BEM-like** class naming (`.request-panel`, `.url-bar`, `.kv-input`, etc.)

### 7.2 Theming

Two themes are toggled by setting `data-theme="dark"` on `<html>`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  --accent: #2563eb;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #e5e7eb;
  --accent: #3b82f6;
  /* ... */
}
```

Every component references variables only — no hardcoded colours in
component code.

### 7.3 HTTP Method & Status Colours

```css
--method-get: #16a34a;
--method-post: #ea580c;
--method-put: #9333ea;
--method-patch: #0891b2;
--method-delete: #dc2626;

--status-success: #16a34a;
--status-redirect: #d97706;
--status-client-error: #dc2626;
--status-server-error: #9333ea;
```

These are applied inline via `style` props in React components.

---

## 8. Data Model

### 8.1 TypeScript Types (`src/types/index.ts`)

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type BodyType  = "none" | "json" | "text" | "form-urlencoded" | "multipart"; // multipart planned

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestBody {
  type: BodyType;
  content: string;
}

interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  // auth?: AuthConfig;         — planned Phase 3
}

interface HttpResponseData {
  status: number;
  status_text: string;
  headers: { key: string; value: string }[];
  body: string;
  duration_ms: number;
  size_bytes: number;
}

interface Collection {
  id: string;
  name: string;
  requests: HttpRequest[];
}
```

### 8.2 Planned Persistence Schema (Phase 0)

SQLite tables:

```
collections
├── id          TEXT PK
├── name        TEXT
└── sort_order  INT

requests
├── id            TEXT PK
├── collection_id TEXT FK → collections.id
├── name          TEXT
├── method        TEXT
├── url           TEXT
├── body_type     TEXT
├── body_content  TEXT
└── sort_order    INT

request_params
├── id         TEXT PK
├── request_id TEXT FK → requests.id
├── key        TEXT
├── value      TEXT
├── enabled    BOOL
└── sort_order INT

request_headers  (same shape as request_params)

environments
├── id        TEXT PK
├── name      TEXT
└── is_active BOOL

environment_variables
├── id     TEXT PK
├── env_id TEXT FK → environments.id
├── key    TEXT
└── value  TEXT
```

---

## 9. Security Model

### 9.1 Principles

1. **No data leaves the machine** by default — all storage is local, no
   telemetry, no accounts.
2. **Sensitive values (tokens, secrets) must not be logged** anywhere in
   the Rust backend. The `log` crate or `println!` should never receive
   auth header values.
3. **CSP is set to `null`** (disabled) in `tauri.conf.json` — this is
   acceptable for a developer tool that makes HTTP requests to arbitrary
   URLs, but should be tightened if a plugin system is later introduced.
4. **Tauri v2 capability model** limits what each window can do. The current
   `core:default` grants basic IPC; future capabilities (dialog, clipboard)
   will be explicitly added.

### 9.2 Threat Surface

| Vector | Mitigation |
|--------|------------|
| Malicious URL in request input | reqwest validates URLs; user is responsible for targets |
| XSS in response body preview | Response body is rendered as text in `<pre>`, not innerHTML |
| Keylogger / clipboard snooping | OS-level concern, not app-specific |
| SQL injection in storage | Use parameterised queries (rusqlite) or safe plugin API |

---

## 10. Development Workflow

### 10.1 Commands

```bash
npm run tauri dev          # Start dev server + Tauri window
npm run tauri build        # Production build

npm run dev                # Vite dev server (standalone, no Tauri)
npm run build              # TypeScript check + Vite build
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm run test               # Vitest

cd src-tauri && cargo fmt --check
cd src-tauri && cargo clippy
cd src-tauri && cargo test
```

### 10.2 IPC Testing

During development, the frontend can run standalone (`npm run dev`) without
Tauri — but `invoke` calls will fail. For UI development, mock the Tauri
invoke or use feature flags. A future improvement could be a mock Tauri
plugin for Vitest.

### 10.3 Release Checklist

1. Bump version in `package.json` and `src-tauri/Cargo.toml` + `tauri.conf.json`
2. Run full lint + typecheck + test suite
3. Build for target platform (`npm run tauri build`)
4. Smoke-test the bundled `.dmg` / `.msi` / `.AppImage`
5. Tag release on GitHub

---

## 11. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Single CSS file** | Project is small; avoids CSS module config overhead. Split when >1000 lines. |
| **No state library** | Prop drilling is manageable at current scale. Re-evaluate when >10 components need shared state. |
| **Raw string body** | Simpler than a typed body enum on the Rust side. Content-Type is user-set. |
| **Per-request reqwest::Client** | Simpler than managing a static client. A pooled client can be added later. |
| **Snake_case Rust ↔ camelCase TS** | No renaming needed — Tauri serialises field names as-is. TS interface matches Rust struct. |
| **SQLite (planned)** | Portable, zero-config, well-supported by Rust. JSON file was considered but lacks querying and atomicity. |

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **Tauri** | A framework for building desktop apps with a web frontend and Rust backend |
| **IPC** | Inter-process communication (frontend ↔ Rust via JSON serialisation) |
| **invoke** | Tauri API call from frontend to backend |
| **reqwest** | Rust HTTP client library |
| **Collection** | A named folder containing one or more saved HTTP requests |
| **Environment** | A named set of variables (key-value pairs) used for `{{variable}}` substitution |
