# Roadmap: Gemini VPN Monitor

## Overview

This roadmap defines the active development of the Gemini VPN Monitor using `@opengsd/gsd-core`: establishing a frameless translucent Electron shell with edge-to-edge drag ergonomics, transitioning to a robust Windows-native persistent ICMP ping engine, and deploying a high-performance zero-delay dual-stream uPlot 60 FPS oscilloscope.

## Phases

- [x] **Phase 1: Window Shell Refactor** - Configure Electron `BrowserWindow` (`frame: false`, `transparent: true`) and build custom draggable React header with isolated `no-drag` controls. (completed 2026-10-31)
- [ ] **Phase 2: Full-Width Draggable Header & Robust Windows-Native Ping Engine** - Expand edge-to-edge header drag region (Discord-style) with strict control isolation, and implement persistent Windows-native `ping.exe` child process stream with CP437/UTF-8 decoding.
- [ ] **Phase 3: Zero-Delay Dual-Stream uPlot Engine** - Implement 60-second `useRef` FIFO buffer, raw zero-delay streaming, and `uPlot` custom canvas hooks for cyber-green waveforms, crimson red 0ms timeout drops, and dual-target telemetry.

---

## Phase Details

### Phase 1: Window Shell Refactor
**Goal**: Completely remove native OS window chrome and provide a seamless, translucent glassmorphic shell with custom fluid drag ergonomics.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-02, SHELL-03
**Success Criteria** (what must be TRUE):
  1. Electron main window initializes with `frame: false` and `transparent: true`, rendering with zero native title bar or OS borders.
  2. Top bar header in React functions as a window drag handle across the entire empty bar region via `-webkit-app-region: drag`.
  3. Interactive buttons (Pin, Settings, Minimize, Close) carry `-webkit-app-region: no-drag`, remain fully clickable, and execute their IPC actions immediately.
**Plans**: 2/2 plans complete

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Electron BrowserWindow Shell & Hardware Acceleration Anti-Glitch

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Custom Draggable Header Ergonomics, Isolated No-Drag Controls, and State Sync

---

### Phase 2: Full-Width Draggable Header & Robust Windows-Native Ping Engine
**Goal**: Provide fluid edge-to-edge Discord-style window dragging across the full header while ensuring rock-solid, accurate ICMP latency telemetry without process-spawning churn or false-positive timeout drops.
**Depends on**: Phase 1
**Requirements**: HEADER-01, HEADER-02, PING-01, PING-02, PING-03
**Success Criteria** (what must be TRUE):
  1. Full-width top header container allows grabbing and moving the window from any non-control pixel edge-to-edge.
  2. Control buttons (Close, Minimize, Settings, Pin) explicitly enforce `-webkit-app-region: no-drag !important` and `pointer-events: none` on inner SVGs, eliminating missed clicks or unintended drags.
  3. Backend ping runner spawns a continuous, persistent `ping.exe` child process stream (`ping -t`) with robust stdout line buffering and CP437/UTF-8 decoding.
  4. Telemetry eliminates false-positive `0ms` drops caused by chunk fragmentation, matching standard Windows Command Prompt outputs.
  5. Ping service architecture is modularized to support arbitrary target endpoints and future interface/gateway bindings for Phase 3 dual-stream telemetry.
**Plans**: 2 plans

Plans:
**Wave 1**
- [ ] 02-01-PLAN.md — Full-width top header drag container and strict button/SVG hit-testing isolation.

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 02-02-PLAN.md — Persistent Windows-native ICMP ping engine with stream decoding and modular target architecture.

---

### Phase 3: Zero-Delay Dual-Stream uPlot Engine
**Goal**: Deliver a 60 FPS Microsoft Task Manager-style network graph with zero React re-render latency and clear timeout drop indicators.
**Depends on**: Phase 2
**Requirements**: GRAPH-01, GRAPH-02, GRAPH-03
**Success Criteria** (what must be TRUE):
  1. Ping telemetry streams directly into a 60-second FIFO queue stored in a React `useRef`, bypassing component state re-render cycles.
  2. Ant Design Charts and unnecessary DOM overhead are removed in favor of `uPlot` canvas rendering.
  3. Active latency renders with cyber-green glowing stroke and translucent gradient area fill.
  4. Ping timeouts plunge sharply down to `0ms` baseline as crimson red drop blocks.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Establish 60s FIFO queue buffer within React `useRef` tied to the IPC stream.
- [ ] 03-02: Configure `uPlot` instance with custom series canvas hooks (`hooks.drawSeries`) for cyber-green gradient styling and crimson red 0ms timeout plunges.
