# Requirements: Gemini VPN Monitor

**Defined:** 2026-10-31  
**Core Value:** Zero-latency, 60 FPS real-time desktop network latency and geo-restriction monitoring with a distraction-free, frameless glassmorphic HUD.

## Milestone Requirements

### Phase 1: Window Shell Refactor

- [x] **SHELL-01**: Configure Electron `BrowserWindow` in `main.js` with `frame: false` and `transparent: true` to strip native OS chrome, caption bar, and border shadows.
- [x] **SHELL-02**: Build a custom glassmorphic top header bar in React with `-webkit-app-region: drag` for fluid desktop repositioning.
- [x] **SHELL-03**: Isolate all clickable header controls (Pin, Settings, Minimize, Close) with explicit `-webkit-app-region: no-drag` and hover states.

### Phase 2: Full-Width Draggable Header & Robust Windows-Native Ping Engine

- [x] **HEADER-01**: Expand draggable region across the entire edge-to-edge width of the top header container bar in `Header.tsx` and `styles.css` (Discord-style dragging).
- [x] **HEADER-02**: Enforce strict controls isolation with `-webkit-app-region: no-drag !important` on all interactive buttons and `pointer-events: none` on child SVGs to guarantee click responsiveness.
- [x] **PING-01**: Replace per-tick `execFile('ping')` process spawning with a persistent `ping.exe -t` child process stream, featuring line-buffering and CP437/UTF-8 decoding.
- [x] **PING-02**: Eliminate stream fragmentation and false-positive `0ms` timeout drops, matching standard Windows CMD ICMP output.
- [x] **PING-03**: Structure the ping service wrapper to support arbitrary target endpoints and future interface bindings for upcoming dual-stream monitoring.

### Phase 3: Zero-Delay Dual-Stream uPlot Engine

- [ ] **GRAPH-01**: Establish a 60-second fixed-capacity rolling FIFO telemetry buffer inside a React `useRef` to eliminate React state re-render bottlenecks.
- [ ] **GRAPH-02**: Integrate `uPlot` canvas engine with raw telemetry streaming (`ping -t` style) bypassing heavy DOM charting overhead.
- [ ] **GRAPH-03**: Implement uPlot series hooks (`hooks.drawSeries`) rendering cyber-green active ping strokes with gradient area fills and crimson red vertical plunges hitting `0ms` on request timeouts.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| HEADER-01 | Phase 2 | Complete |
| HEADER-02 | Phase 2 | Complete |
| PING-01 | Phase 2 | Complete |
| PING-02 | Phase 2 | Complete |
| PING-03 | Phase 2 | Complete |
| GRAPH-01 | Phase 3 | Planned |
| GRAPH-02 | Phase 3 | Planned |
| GRAPH-03 | Phase 3 | Planned |

