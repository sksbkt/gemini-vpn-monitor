# Requirements: Gemini VPN Monitor

**Defined:** 2026-10-31  
**Core Value:** Zero-latency, 60 FPS real-time desktop network latency and geo-restriction monitoring with a distraction-free, frameless glassmorphic HUD.

## Milestone Requirements

### Phase 1: Window Shell Refactor

- [ ] **SHELL-01**: Configure Electron `BrowserWindow` in `main.js` with `frame: false` and `transparent: true` to strip native OS chrome, caption bar, and border shadows.
- [ ] **SHELL-02**: Build a custom glassmorphic top header bar in React with `-webkit-app-region: drag` for fluid desktop repositioning.
- [ ] **SHELL-03**: Isolate all clickable header controls (Pin, Settings, Minimize, Close) with explicit `-webkit-app-region: no-drag` and hover states.

### Phase 2: Zero-Delay uPlot Engine

- [ ] **GRAPH-01**: Establish a 60-second fixed-capacity rolling FIFO telemetry buffer inside a React `useRef` to eliminate React state re-render bottlenecks.
- [ ] **GRAPH-02**: Integrate `uPlot` canvas engine with raw telemetry streaming (`ping -t` style) bypassing heavy DOM charting overhead.
- [ ] **GRAPH-03**: Implement uPlot series hooks (`hooks.drawSeries`) rendering cyber-green active ping strokes with gradient area fills and crimson red vertical plunges hitting `0ms` on request timeouts.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Planned |
| SHELL-02 | Phase 1 | Planned |
| SHELL-03 | Phase 1 | Planned |
| GRAPH-01 | Phase 2 | Planned |
| GRAPH-02 | Phase 2 | Planned |
| GRAPH-03 | Phase 2 | Planned |

