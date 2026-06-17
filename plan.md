# Reqster — Plan

Reqster is an open-source, cross-platform **desktop API client** built with
**Tauri**. Its goal is to provide a **fast, lightweight, local-first** alternative
to tools like Postman and Insomnia, focused on core API testing workflows without
cloud dependency.

This document defines **what we're building** (requirements) and **how we'll build
it** (phased implementation tasks).

---

## 1. Current Status (v0.1.0)

| Feature Area          | Completion | Next Action                       |
|-----------------------|------------|-----------------------------------|
| HTTP Request Sending  | ~70%       | Multipart body, auth injection    |
| Response Display      | ~88%       | Save to file, raw/pretty toggle   |
| Collections & Storage | 0%         | **Phase 0 — first priority**      |
| Environments          | 0%         | Phase 2                           |
| Authentication        | 0%         | Phase 3                           |
| UI / Theme            | 100%       | Polish in Phase 5                 |
| Testing               | 0%         | Phase 5.4                         |

---

## 2. Supported Platforms

- ✅ Windows (x64)
- ✅ macOS (Apple Silicon + Intel)
- ✅ Linux (x64)

---

## 3. Feature Specification

Requirements are labelled **MUST** (required for v0.x), **SHOULD** (high priority
but not blocking), and **OPTIONAL** (post-v1).

### 3.1 HTTP Request Handling

| Req | Priority | Detail |
|-----|----------|--------|
| Methods | **MUST** | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS |
| URL input | **MUST** | Text input with Enter-to-send |
| Query parameters | **MUST** | Key-value editor, enable/disable per param |
| Headers | **MUST** | Key-value editor, enable/disable per header |
| Request body — JSON | **MUST** | Textarea with pretty hint |
| Request body — Plain text | **MUST** | Raw textarea |
| Request body — Form URL-encoded | **MUST** | Key-value editor → serialised body |
| Request body — Multipart form-data | **SHOULD** | Key-value editor with file support |
| Request body — none | **MUST** | No body sent |

### 3.2 Response Handling

| Req | Priority | Detail |
|-----|----------|--------|
| Status code | **MUST** | Badge with colour by category (2xx/3xx/4xx/5xx) |
| Response time | **MUST** | Displayed in ms |
| Response size | **MUST** | Human-readable (B, KB, MB) |
| Response headers | **MUST** | Table view with key/value columns |
| Pretty-printed JSON | **MUST** | Auto-detected, indented |
| Raw text view | **MUST** | Fallback when JSON parse fails |
| Copy body to clipboard | **SHOULD** | Button with "Copied!" feedback |
| Save response to file | **SHOULD** | Native save dialog |
| Raw / pretty toggle | **SHOULD** | Switch between views |
| Response body search | **OPTIONAL** | Filter within large bodies |

### 3.3 Collections & Requests

| Req | Priority | Detail |
|-----|----------|--------|
| Save requests locally | **MUST** | Persist to disk (SQLite) |
| Edit saved requests | **MUST** | Modify and re-save |
| Organise into collections | **MUST** | Folder hierarchy in sidebar |
| Reorder collections/requests | **SHOULD** | Drag-and-drop or arrow buttons |
| Duplicate requests | **SHOULD** | Quick clone within a collection |
| Move between collections | **SHOULD** | Drag or context menu |

### 3.4 Environments & Variables

| Req | Priority | Detail |
|-----|----------|--------|
| `{{variable}}` substitution | **MUST** | In URL, headers, and body |
| Multiple environments | **MUST** | e.g. Local, Staging, Prod |
| Environment switching | **SHOULD** | Dropdown in header, instant re-resolution |

### 3.5 Authentication

| Req | Priority | Detail |
|-----|----------|--------|
| No-auth (default) | **MUST** | Send bare request |
| API Key | **MUST** | As header or query parameter |
| Bearer Token | **MUST** | `Authorization: Bearer <token>` |
| Basic Auth | **SHOULD** | `Authorization: Basic <base64>` |
| OAuth 2.0 (Auth Code flow) | **OPTIONAL** | Post-v1 |

### 3.6 Local Storage

| Req | Priority | Detail |
|-----|----------|--------|
| Fully offline | **MUST** | No network required for operation |
| No accounts | **MUST** | No login, no cloud sync |
| Structured storage | **SHOULD** | SQLite preferred over flat JSON |

### 3.7 User Interface

| Req | Priority | Detail |
|-----|----------|--------|
| Light / dark mode | **MUST** | CSS variables, toggle in header |
| Responsive layout | **MUST** | Usable down to 800×600 |
| Sidebar (collections) | **MUST** | Tree with method badges |
| Request editor (main panel) | **MUST** | URL bar, tabs, body editor |
| Response viewer (secondary) | **MUST** | Status bar, body/headers tabs |
| Environments in sidebar | **SHOULD** | Section below collections |
| Resizable split | **SHOULD** | Drag handle between request/response |

### 3.8 Non-Functional Requirements

| Req | Priority | Detail |
|-----|----------|--------|
| Fast startup | **SHOULD** | < 2 seconds on modern hardware |
| Non-blocking requests | **SHOULD** | Async Rust, UI stays responsive |
| Low memory | **SHOULD** | Significantly lower than Electron tools |
| Secrets not logged | **SHOULD** | Auth tokens must never appear in logs |
| Modular backend | **SHOULD** | Core HTTP logic in Rust, UI via Tauri commands |

---

## 4. Explicit Non-Goals (v0.x)

The following are **out of scope** for initial versions and will not be
prioritised before v1.0:

- Team collaboration
- Cloud sync
- User accounts
- Analytics or tracking
- API mocking
- Automated tests / collections runner
- GraphQL client
- WebSocket / gRPC client

---

## 5. Implementation Phases

Tasks are tagged with the layer they affect:

- `[frontend]` — React / TypeScript / CSS
- `[backend]` — Rust / Tauri
- `[both]` — both layers

---

### Phase 0 — Local Persistence (Foundation)

*Everything depends on storage. No data survives a restart today.*

#### 0.1 Choose and set up storage engine
- [ ] Decide: `rusqlite` (raw SQLite) vs `tauri-plugin-sql` vs flat JSON file
- [ ] If SQLite: add crate dependency; create schema (collections, requests, environments)
- [ ] If JSON: design file layout under Tauri's app data directory
- [ ] Create Tauri command(s) for init / read / write
- [ ] Migrate `collections` state from in-memory to persisted

#### 0.2 Schema design

```sql
collections (id TEXT PK, name TEXT, sort_order INT)

requests (id TEXT PK, collection_id TEXT FK, name TEXT, method TEXT,
          url TEXT, body_type TEXT, body_content TEXT, sort_order INT)

request_params    (id TEXT PK, request_id TEXT FK, key TEXT, value TEXT, enabled BOOL, sort_order INT)
request_headers   (id TEXT PK, request_id TEXT FK, key TEXT, value TEXT, enabled BOOL, sort_order INT)

environments              (id TEXT PK, name TEXT, is_active BOOL)
environment_variables     (id TEXT PK, env_id TEXT FK, key TEXT, value TEXT, enabled BOOL)
```

#### 0.3 Rust CRUD commands
- [ ] `create_collection`, `rename_collection`, `delete_collection`
- [ ] `save_request`, `update_request`, `delete_request`, `duplicate_request`
- [ ] `list_collections` (returns full tree: collections → requests → params/headers/body)
- [ ] `create_environment`, `rename_environment`, `delete_environment`
- [ ] `set_active_environment`, `list_environments`
- [ ] `save_environment_variable`, `delete_environment_variable`

#### 0.4 Frontend persistence hooks
- [ ] Replace static `useState<Collection[]>([])` with effect that loads on mount
- [ ] Auto-save on request changes (debounced, or explicit save button)
- [ ] Show saved/unsaved indicator

---

### Phase 1 — Collections CRUD

*Build on top of storage to give the user full control over their workspace.*

#### 1.1 Sidebar — collection management
- [ ] Add "New Collection" button / context menu `[frontend]`
- [ ] Inline rename on double-click `[frontend]`
- [ ] Delete collection with confirmation dialog `[frontend]`
- [ ] Drag-and-drop to reorder collections and requests (or arrow buttons) `[frontend]`

#### 1.2 Sidebar — request management
- [ ] Context menu on request items: Rename, Duplicate, Delete `[frontend]`
- [ ] Drag-and-drop reorder `[frontend]`
- [ ] Move request between collections `[frontend]`

#### 1.3 Request editor integration
- [ ] Wire "Save" button / auto-save in RequestPanel `[frontend]`
- [ ] Show request name as editable field in the panel header `[frontend]`
- [ ] Keyboard shortcut: `Cmd/Ctrl+S` to save `[frontend]`

---

### Phase 2 — Environment Variables

*Core feature for realistic API workflows. Depends on storage (Phase 0).*

#### 2.1 Backend variable resolution
- [ ] Rust function `resolve_variables(input: &str, env_id: &str) -> String`
      that replaces `{{key}}` with the active environment's value `[backend]`
- [ ] Call `resolve_variables` on URL, each header value, and body before
      dispatching the HTTP request `[backend]`
- [ ] Pass `active_environment_id` from frontend to `send_request` command `[both]`

#### 2.2 Environments UI
- [ ] Environment switcher drop-down in the header (or sidebar bottom) `[frontend]`
- [ ] "Manage Environments" dialog with key-value editor per environment `[frontend]`
- [ ] Quick indicator showing which variables are in use in the current request `[frontend]`

#### 2.3 Editor integration
- [ ] Syntax highlight `{{variable}}` patterns in URL input and body textarea `[frontend]`
- [ ] Autocomplete / suggestions for known variable names `[frontend]`

---

### Phase 3 — Authentication

*Replace the auth placeholder with real, working auth types.*

#### 3.1 Auth state model
- [ ] Extend `HttpRequest` type with `auth` field `[frontend]`

```ts
interface AuthConfig {
  type: "none" | "api-key" | "bearer" | "basic";
  // API Key
  apiKeyKey?: string;
  apiKeyValue?: string;
  apiKeyIn?: "header" | "query";
  // Bearer
  bearerToken?: string;
  // Basic
  basicUsername?: string;
  basicPassword?: string;
}
```

#### 3.2 Auth tab UI
- [ ] Radio / dropdown to select auth type `[frontend]`
- [ ] Conditional form fields per auth type `[frontend]`
- [ ] "Preview" showing what headers will be sent `[frontend]`

#### 3.3 Backend auth injection
- [ ] Modify `send_request` (or pre-process in frontend) to inject auth headers `[both]`
  - **API Key**: add header or query param
  - **Bearer**: add `Authorization: Bearer <token>` header
  - **Basic**: add `Authorization: Basic <base64>` header
- [ ] Ensure sensitive values are not logged in Rust `[backend]`
- [ ] Optionally mask token values in the UI `[frontend]`

---

### Phase 4 — Body & Response Enhancements

*Completing the HTTP feature set and response UX.*

#### 4.1 Multipart form-data body
- [ ] Add `"multipart"` to `BodyType` type `[frontend]`
- [ ] When `multipart` is selected, show key-value editor instead of textarea `[frontend]`
- [ ] Send multipart requests via reqwest's `multipart` feature (already in deps) `[backend]`
- [ ] Auto-set `Content-Type: multipart/form-data; boundary=...` `[backend]`

#### 4.2 Save response to file
- [ ] Add "Save as…" button in ResponsePanel status bar `[frontend]`
- [ ] Use `@tauri-apps/plugin-dialog` to show save dialog `[frontend]`
- [ ] Write response body to chosen file path via Tauri command `[backend]`

#### 4.3 Response viewer polish
- [ ] Toggle between raw and pretty-printed JSON `[frontend]`
- [ ] Line numbers for JSON bodies `[frontend]`
- [ ] Collapsible JSON tree view (nice-to-have) `[frontend]`
- [ ] Search / filter within response body `[frontend]`

#### 4.4 Response headers — copy individual values
- [ ] Add copy button per header row `[frontend]`
- [ ] Show header count badge in tab `[frontend]`

---

### Phase 5 — Shortcuts, Polish & DX

*Quality-of-life improvements that make the app feel professional.*

#### 5.1 Keyboard shortcuts
- [ ] `Cmd/Ctrl+Enter` — Send request `[frontend]`
- [ ] `Cmd/Ctrl+N` — New request `[frontend]`
- [ ] `Cmd/Ctrl+Shift+N` — New collection `[frontend]`
- [ ] `Cmd/Ctrl+S` — Save current request `[frontend]`
- [ ] `Esc` — Close modals / deselect `[frontend]`
- [ ] Tab navigation between URL bar, method selector, and body `[frontend]`

#### 5.2 UI polish
- [ ] Responsive sidebar collapse (hamburger menu on narrow screens) `[frontend]`
- [ ] Resizable split between request panel and response panel `[frontend]`
- [ ] Tab counts for active params/headers (currently implemented only for
      Params and Headers tabs — extend to Body size) `[frontend]`
- [ ] Confirmation dialogs for destructive actions (delete, overwrite) `[frontend]`
- [ ] Toast notifications for save/copy/error events `[frontend]`

#### 5.3 Performance
- [ ] Debounce auto-save to avoid thrashing on keystroke `[frontend]`
- [ ] Virtualise large response bodies (if > 1 MB) `[frontend]`
- [ ] Cancellation of in-flight HTTP requests (AbortController + reqwest abort) `[both]`

#### 5.4 Testing
- [ ] Write Vitest unit tests for `useRequest` hook `[frontend]`
- [ ] Write Vitest tests for `KeyValueEditor` and other components `[frontend]`
- [ ] Write Rust unit tests for `resolve_variables` and auth injection `[backend]`
- [ ] Integration test: send a real request to an echo server and verify response `[both]`

---

### Phase 6 — Future / Post-v1

*Not committed for v0.x, but tracked for later.*

| Area | Details |
|------|---------|
| **Import / Export** | Postman v2.1, Insomnia JSON, cURL export |
| **Request History** | Track last N requests, "Recent" sidebar section |
| **CLI Companion** | `reqster run <collection>/<request>` |
| **Extensibility** | Plugin system (wasm / Lua), pre/post hooks, custom themes |
| **Additional Protocols** | GraphQL, WebSocket, gRPC |

---

## 6. Dependency Graph

```
Phase 0 (Storage)
  └── Phase 1 (Collections CRUD)
  └── Phase 2 (Environments)
        └── Phase 3 (Auth) — can start in parallel with Phase 2
  └── Phase 4 (Body & Response)
  └── Phase 5 (Polish) — can start after Phase 1
        └── Phase 6 (Future)
```

Phases **2 and 3** can be developed in parallel since they touch different
parts of the codebase (environments vs auth). Phase **4** can also start
once Phase 0 is stable.

---

## 7. Versioning

This plan reflects the scope for **Reqster v0.x**. Breaking changes to
requirements or roadmap MUST be documented and the file version bumped.
