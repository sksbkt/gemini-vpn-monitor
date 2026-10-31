# Roadmap: Gemini VPN Monitor

## Overview

This roadmap defines the active migration to `@opengsd/gsd-core` and the execution of two core priorities: establishing a frameless, transparent Electron desktop shell with custom drag handlers, followed by integrating a high-performance zero-delay uPlot 60 FPS oscilloscope engine with cyber-green gradient strokes and crimson red 0ms timeout plunges.

## Phases

- [ ] **Phase 1: Window Shell Refactor** - Configure Electron `BrowserWindow` (`frame: false`, `transparent: true`) and build custom draggable React header with isolated `no-drag` controls.
- [ ] **Phase 2: Zero-Delay uPlot Engine** - Implement 60-second `useRef` FIFO buffer, raw zero-delay streaming, and `uPlot` custom canvas hooks for cyber-green waveforms and 0ms crimson timeout drops.

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
**Plans**: 2 plans

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Electron BrowserWindow Shell & Hardware Acceleration Anti-Glitch

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Custom Draggable Header Ergonomics, Isolated No-Drag Controls, and State Sync

---

### Phase 2: Zero-Delay uPlot Engine
**Goal**: Deliver a 60 FPS Microsoft Task Manager-style network graph with zero React re-render latency and clear timeout drop indicators.
**Depends on**: Phase 1
**Requirements**: GRAPH-01, GRAPH-02, GRAPH-03
**Success Criteria** (what must be TRUE):
  1. Ping telemetry streams directly into a 60-second FIFO queue stored in a React `useRef`, bypassing component state re-render cycles.
  2. Ant Design Charts and unnecessary DOM overhead are removed in favor of `uPlot` canvas rendering.
  3. Active latency renders with cyber-green glowing stroke and translucent gradient area fill.
  4. Ping timeouts plunge sharply down to `0ms` baseline as crimson red drop blocks.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Remove legacy charting dependencies and construct high-speed 60s FIFO queue buffer within React `useRef` tied to the IPC stream.
- [ ] 02-02: Configure `uPlot` instance with custom series canvas hooks (`hooks.drawSeries`) for cyber-green gradient styling and crimson red 0ms timeout plunges.
