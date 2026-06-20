# webmcp-starter

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) · [strattlabs.com](https://strattlabs.com)

A minimal, well-commented reference page that exposes its own features to an
in-browser AI agent via **[WebMCP](https://developer.chrome.com/docs/ai/webmcp/imperative-api)**
(the Web Model Context Protocol). It's a tiny to-do list where every tool an agent
can call is wired to the same UI a human uses.

> **Status:** scaffold / educational reference. WebMCP is an early
> **origin-trial** feature and its API is still moving — treat this as a starting
> point and **verify the API against the current Chrome docs** before relying on
> it. Notable: the surface moved from `navigator.modelContext` to
> `document.modelContext` (the latter is current; the former is deprecated in
> Chrome 150). This starter feature-detects both.

## What it demonstrates

The core WebMCP pattern, nothing more:

1. Keep your app logic **UI-agnostic** (`addTodo`, `completeTodo`).
2. Register thin tools with `modelContext.registerTool({ name, description, inputSchema, execute })`.
3. Each tool's `execute` handler calls the **same logic a human click would**, and
   returns a short string describing what happened, which the agent relays.

Registered tools in this demo: `add_todo`, `list_todos`, `complete_todo`. See
[`public/tools.js`](public/tools.js) — it is the whole point of the repo and is
heavily commented.

## Run it

It's plain static HTML/CSS/JS — no build step.

```bash
# any static server works, e.g.:
npx --yes serve ./public
# or:
python3 -m http.server --directory public 8080
```

Then open the served URL. Without WebMCP enabled it behaves as an ordinary to-do
list and shows a status banner saying the tools weren't registered.

## Enable WebMCP (origin trial)

WebMCP is gated behind a Chrome **origin trial**:

1. Use a Chrome version that includes the WebMCP origin trial (Chrome 149+).
2. Register your origin and get a token at
   <https://developer.chrome.com/origintrials>.
3. Paste the token into the commented `<meta http-equiv="origin-trial" …>` tag in
   [`public/index.html`](public/index.html).
4. Reload — the status banner should report the tools as registered.

(For purely local experimentation you may instead enable the relevant
`chrome://flags` entry, if available in your build. Flags and trial details change
between Chrome versions; check the current docs.)

## What this is

An **educational reference** for the tool-registration pattern: it shows how a
page *exposes* browser-side tools to an in-browser agent via WebMCP.

## Roadmap

- Add a tool that demonstrates `inputSchema` validation feedback.
- Show `provideContext([...])` (replace the whole toolset) alongside per-tool
  `registerTool`.
- A short note on `annotations` (`readOnlyHint`, `untrustedContentHint`) and why
  they matter for agent safety.

## Sources

- [Imperative API — AI on Chrome](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Join the WebMCP origin trial — Chrome for Developers](https://developer.chrome.com/blog/ai-webmcp-origin-trial)

## License

[MIT](LICENSE) © 2026 Stratt Labs.

---

## Part of the Stratt Labs toolkit for the agentic web

Small, standards-friendly tools from [Stratt Labs](https://strattlabs.com):

- [agent-readiness-manifest](https://github.com/strattlabs/agent-readiness-manifest)
  — an open declaration spec for agent discovery.
- [llms-txt-kit](https://github.com/strattlabs/llms-txt-kit) — generate and
  validate `llms.txt` / `llms-full.txt` files.
- [schema-for-agents](https://github.com/strattlabs/schema-for-agents) — JSON-LD
  recipes for agent-legible commerce and content.
