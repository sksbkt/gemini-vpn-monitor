# Phase 2: Full-Width Draggable Header & Robust Windows-Native Ping Engine - Context

**Gathered:** 2026-10-31  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers two critical system enhancements:
1. Polish the desktop window header to provide full-width edge-to-edge draggable ergonomics (Discord-style dragging) across the top card border, while strictly isolating interactive control buttons (Close, Minimize, Settings, Pin) with `-webkit-app-region: no-drag !important` and `pointer-events: none` on inner SVGs so clicks never trigger window dragging.
2. Refactor the backend ICMP ping engine in `main.js` from single-shot `execFile('ping')` executions to a continuous, persistent `ping.exe -t` child process stream. The new engine handles robust line buffering, CP437/UTF-8 stdout decoding, eliminates false-positive `0ms` timeout drops caused by stream fragmentation, ensures latency accuracy matching standard Windows CMD outputs, and establishes a modular multi-target wrapper architected for Phase 3's upcoming dual-stream pipeline (VPN-routed vs. direct physical gateway).
</domain>

<decisions>
## Implementation Decisions

### 1. Full-Width Discord-Style Draggable Header
- **D-01:** Expand draggable region (`-webkit-app-region: drag`) across the entire top header container bar (edge-to-edge width) in `Header.tsx` and `styles.css` so users can grab anywhere along the top border like modern desktop apps (Discord-style), rather than being restricted to a localized center handle.
- **D-02:** Strict controls isolation on all interactive buttons (`#closeBtn`, `#minBtn`, `#settingsBtn`, `#pinBtn`) and `.window-controls` enforcing `-webkit-app-region: no-drag !important` and `pointer-events: none` on all child SVGs and icons to eliminate missed clicks or accidental window drags.

### 2. Windows-Native Robust Ping Engine
- **D-03:** Transition from repetitive `execFile('ping', ['-n', '1', ...])` timer polling to a persistent child process stream (`spawn('ping', [target, '-t', ...])`) to eliminate high-frequency process creation overhead and Windows process lifecycle churn.
- **D-04:** Robust stdout line-buffering and encoding decoding (supporting CP437 OEM console encoding and UTF-8) to prevent regex parsing failures on international Windows versions and fragmented chunk boundaries.
- **D-05:** Zero false-positive `0ms` drops: Latency parser must strictly match standard Windows CMD `Reply from ...: bytes=32 time=XXms TTL=YY` patterns, distinguishing real network packet loss / timeouts from buffering pauses or stream chunk splits.
- **D-06:** Multi-target architectural foundation (Phase 3 Prep): Structure the ping runner service as an extensible class or modular service accepting target endpoints and future interface/gateway bindings, laying the foundation for simultaneous dual-stream monitoring (VPN tunnel vs. direct gateway).

### the agent's Discretion
- Choice of line-buffering pattern (e.g., standard readline transform or chunk split on newline).
- Process restart / recovery logic if `ping.exe` process unexpectedly exits.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Electron Backend & IPC
- `main.js` — Ping execution, timer loop, settings persistence, and IPC broadcasting (`status:update`).
- `preload.js` — Context bridge exposing `window.api` IPC channels.

### Frontend Window & Header
- `src/components/Header.tsx` — Top bar header layout, title, and window control buttons.
- `styles.css` — Glassmorphic widget styling, header drag regions, and `.win-btn` styling.

### Planning Documents
- `.planning/REQUIREMENTS.md` — Requirements HEADER-01, HEADER-02, PING-01, PING-02, PING-03.
- `.planning/ROADMAP.md` — Phase 2 deliverables and success criteria.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `main.js`: `sanitizeTarget()` utility cleanses host/IP inputs before passing to ping.
- `src/components/Header.tsx`: Already has clean icon SVGs and click handlers connected to IPC bridge.
- `styles.css`: Glassmorphic styling with `-webkit-app-region` rules in place from Phase 1.

### Established Patterns
- IPC communication via `mainWindow.webContents.send('status:update', data)`.
- Electron window management via `window:close`, `window:minimize`, `window:toggle-pin`.

### Integration Points
- `main.js`: Replace `runPing` and the `setInterval` in `startMonitoring()` with the new persistent stream service.
- `src/components/Header.tsx` & `styles.css`: Header container width and drag styles.
</code_context>

<specifics>
## Specific Ideas

- **Discord-style dragging:** Grabbing the window header bar anywhere on its background effortlessly drags the widget across multiple monitors.
- **CMD-Parity Accuracy:** The ping numbers reported in the UI should match what running `ping -t 4.2.2.4` in Windows Command Prompt outputs in real time.
</specifics>

<deferred>
## Deferred Ideas

- **Phase 3:** Zero-Delay Dual-Stream uPlot Engine: 60 FPS Task Manager-style network graph with `useRef` rolling FIFO queue, cyber-green active strokes, crimson red 0ms timeout drop blocks, and dual-target telemetry (VPN-routed vs gateway).
</deferred>

---

*Phase: 02-Full-Width Draggable Header & Robust Windows-Native Ping Engine*  
*Context gathered: 2026-10-31*
