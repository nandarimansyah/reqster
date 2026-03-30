# Reqster – Requirements

## 1. Overview

Reqster is an open-source, cross-platform **desktop API client** built with **Tauri**.
Its goal is to provide a **fast, lightweight, local-first** alternative to tools like
Postman and Insomnia, focused on core API testing workflows without cloud dependency.

This document defines the **functional requirements**, **non-functional requirements**,
and **explicit non-goals** of the project.

---

## 2. Target Users

- Backend developers
- Frontend developers
- API designers
- SRE / DevOps engineers
- Students learning HTTP / REST

---

## 3. Supported Platforms

Reqster MUST support:

- ✅ Windows (x64)
- ✅ macOS (Apple Silicon + Intel)
- ✅ Linux (x64)

---

## 4. Functional Requirements

### 4.1 HTTP Request Handling

The application MUST support:

- HTTP methods:
  - GET
  - POST
  - PUT
  - PATCH
  - DELETE
  - HEAD
  - OPTIONS

- Request components:
  - URL input
  - Query parameters
  - Headers (custom + common headers)
  - Request body:
    - JSON
    - Plain text
    - Form URL-encoded
    - Multipart form-data

---

### 4.2 Response Handling

The application MUST display:

- HTTP status code
- Response time
- Response size
- Response headers
- Response body:
  - Pretty-printed JSON
  - Raw text view

The application SHOULD support:

- Copy response body to clipboard
- Save response to file

---

### 4.3 Collections & Requests

The application MUST support:

- Saving requests locally
- Editing saved requests
- Organizing requests into collections (folders)

The application SHOULD support:

- Reordering collections and requests
- Duplicating requests

---

### 4.4 Environments & Variables

The application MUST support:

- Environment variables (e.g. `{{base_url}}`)
- Multiple environments (e.g. Local, Staging, Prod)
- Variable substitution in:
  - URLs
  - Headers
  - Request body

The application SHOULD support:

- Environment switching at runtime

---

### 4.5 Authentication

The application MUST support:

- No-auth requests
- API Key authentication
- Bearer token authentication

The application SHOULD support:

- Basic Auth
- OAuth 2.0 (Authorization Code flow) — optional, post-v1

---

### 4.6 Local Storage

The application MUST:

- Store all data locally on the user’s machine
- Work fully offline
- Not require an account or login

The application SHOULD:

- Use a structured local storage format (JSON or SQLite)

---

## 5. User Interface Requirements

### 5.1 General UI

- The UI MUST be responsive and usable on small screens
- The UI MUST support:
  - Light mode
  - Dark mode
- The UI MUST prioritize speed and minimalism

---

### 5.2 Layout

The UI SHOULD include:

- Sidebar:
  - Collections
  - Environments
- Main panel:
  - Request editor
- Secondary panel:
  - Response viewer

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Application startup time SHOULD be fast (< 2 seconds on modern hardware)
- Sending requests SHOULD not block the UI
- Memory usage SHOULD be significantly lower than Electron-based tools

---

### 6.2 Security

- Sensitive values (tokens, secrets) SHOULD NOT be logged
- Sensitive values SHOULD be stored securely when possible
- The application MUST not send data to external services by default

---

### 6.3 Extensibility

- Core HTTP logic SHOULD live in the Tauri (Rust) backend
- UI SHOULD communicate via well-defined Tauri commands
- Codebase SHOULD be modular to allow future:
  - CLI reuse
  - Plugin system
  - Scripting

---

## 7. Open Source Requirements

The project MUST:

- Be publicly available on GitHub
- Use an OSI-approved license (MIT preferred)
- Include:
  - README.md
  - requirements.md
  - CONTRIBUTING.md
- Accept community contributions via pull requests

---

## 8. Explicit Non-Goals (For v0.x)

The following are **out of scope** for initial versions:

- Team collaboration
- Cloud sync
- User accounts
- Analytics or tracking
- API mocking
- Automated tests / collections runner
- GraphQL client (initially)
- WebSockets / gRPC (initially)

These MAY be considered after v1.0.

---

## 9. Future Considerations

Potential future enhancements (non-binding):

- Import from Postman / Insomnia
- Export collections
- CLI companion tool
- Request history
- Scriptable pre-request / post-response hooks

---

## 10. Versioning

This requirements document reflects the scope for **Reqster v0.x**.
Breaking requirement changes MUST be documented and versioned.
