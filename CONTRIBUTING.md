# Contributing to Reqster

Thank you for considering contributing to **Reqster** 🎉
Reqster is an open-source, cross-platform desktop API client built with **Tauri**.
We welcome contributions of all kinds: code, documentation, design, bug reports,
and feature ideas.

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and constructive
- Assume good intent
- Keep discussions professional and technical
- Help create a welcoming community

Harassment or abusive behavior is not tolerated.

---

## Ways to Contribute

You can contribute by:

- Reporting bugs
- Suggesting new features or improvements
- Improving documentation
- Fixing bugs or implementing features
- Enhancing UI/UX
- Improving performance or security

You do not need prior experience with Tauri or Rust to contribute.

---

## Tech Stack

- **Frontend:** React + TypeScript, bundled with Vite
- **Backend:** Rust via Tauri
- **Desktop shell:** Tauri v2

---

## Project Structure (Overview)

reqster/
- src-tauri/   # Tauri backend (Rust)
- src/         # Frontend UI (React + TypeScript)
- README.md
- requirements.md
- CONTRIBUTING.md

---

## Development Prerequisites

Before getting started, make sure you have:

- Node.js (LTS recommended)
- Rust toolchain (stable)
- Tauri OS prerequisites installed
  https://tauri.app/start/prerequisites/

---

## Getting Started

1. Fork this repository
2. Clone your fork

   git clone https://github.com/<your-username>/reqster.git
   cd reqster

3. Install dependencies

   npm install

4. Run Reqster in development mode

   npm run tauri dev

---

## Running Tests and Linting

Before submitting a PR, make sure everything passes locally.

**Frontend (TypeScript / React):**

   npm run lint        # ESLint
   npm run typecheck   # TypeScript type check
   npm run test        # Vitest unit tests

**Backend (Rust):**

   cd src-tauri
   cargo fmt --check   # Format check
   cargo clippy        # Lint
   cargo test          # Unit tests

---

## Branching Strategy

- main: stable branch
- feature/<name>: new features
- fix/<name>: bug fixes

Examples:
- feature/environment-variables
- fix/response-viewer-scroll

---

## Commit Message Guidelines

Please use clear and descriptive commit messages.
The recommended format is:

type(scope): short summary

Examples:
- feat(http): add PATCH method support
- fix(ui): prevent response overflow
- docs: improve installation instructions

---

## Pull Request Guidelines

Before submitting a pull request:

- Ensure the application builds and runs
- Keep changes focused and minimal
- Follow existing code style
- Update documentation if behavior changes

Pull requests with UI changes should include screenshots when possible.

---

## Reporting Bugs

When reporting bugs, please include:

- Operating system and version
- Reqster version
- Steps to reproduce
- Expected and actual behavior
- Screenshots or logs if available

---

## Feature Requests

Feature requests should:

- Clearly describe the problem being solved
- Align with the goals in requirements.md
- Avoid scope creep (cloud sync, accounts, tracking are non-goals)

Discussion before implementation is encouraged.

---

## Code Style Expectations

Rust:
- Prefer idiomatic Rust
- Avoid unnecessary abstractions
- Use async thoughtfully

Frontend:
- Keep components small and focused
- Avoid large monolithic components
- Prefer explicit over clever

---

## Licensing

By contributing to Reqster, you agree that your contributions will be licensed
under the MIT License.

---

## Need Help?

If you are unsure where to start:

- Look for issues labeled "good first issue"
- Ask questions in issue discussions
- Propose ideas — discussion is welcome

Thank you for helping improve **Reqster** ❤️
