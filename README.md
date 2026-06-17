# Reqster

Reqster is an open-source, cross-platform desktop API client for testing,
debugging, and exploring HTTP/REST APIs. Built with Tauri for a fast,
lightweight, local-first experience — no accounts, no cloud sync.

> A developer-friendly alternative to Postman and Insomnia.

📖 **Full documentation:** [https://nandarimansyah.github.io/reqster](https://nandarimansyah.github.io/reqster)

---

## Features

- Send HTTP requests (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Query params, headers, and request body (JSON, form, multipart)
- Environment variables and multiple environments (Local, Staging, Prod)
- Collections and folders to organize requests
- API Key and Bearer token authentication
- Pretty-printed JSON response viewer
- Light and dark mode
- Fully offline — all data stored locally

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React + TypeScript + Vite   |
| Backend  | Rust (Tauri commands)       |
| Desktop  | Tauri v2                    |

---

## Supported Platforms

- Windows (x64)
- macOS (Apple Silicon + Intel)
- Linux (x64)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Rust toolchain](https://www.rust-lang.org/tools/install) (stable)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Install and run

```bash
git clone https://github.com/nandarimansyah/reqster.git
cd reqster
npm install
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

---

## Documentation

- 📖 [GitHub Pages site](https://nandarimansyah.github.io/reqster) — full documentation with architecture, roadmap, and more
- [ARCHITECTURE.md](./ARCHITECTURE.md) — detailed architecture documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute, dev setup, and code style
- [plan.md](./plan.md) — development roadmap and feature specification

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
before opening a pull request.

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built with ❤️ by [Nanda Rimansyah](https://github.com/nandarimansyah)*
