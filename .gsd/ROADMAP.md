---
milestone: Modernize & Integrate React/uPlot
version: 1.1.0
updated: 2026-10-22T19:02:25+03:30
---

# Roadmap

> **Current Phase:** Phase 1: Toolchain & Vite Build Setup
> **Status:** planning

## Must-Haves (from SPEC)

- [ ] Vite + React + TypeScript build pipeline configured with relative paths for Electron
- [ ] Explicit package dependencies installed and registered in `package.json`
- [ ] Rebuilt glassmorphic HUD in React preserving controls, status pill, and metrics grid
- [ ] Active integration of `PingOscilloscope.tsx` canvas engine driven by IPC telemetry
- [ ] Verified smooth 60 FPS rendering and functional window management

---

## Phases

### Phase 1: Toolchain & Vite Build Setup
**Status:** 🔄 In Progress
**Objective:** Configure Vite, TypeScript, and React build tooling for the Electron renderer, update `package.json`, and verify clean compilation.
**Requirements:** Vite config with `base: './'`, TypeScript config, npm scripts (`dev`, `build`, `start`), Electron main process loading dev server or `dist/index.html`.

**Plans:**
- [ ] Plan 1.1: Package dependencies & TypeScript/Vite configuration
- [ ] Plan 1.2: Electron main process loading adapter & build verification

---

### Phase 2: React HUD Shell & Telemetry State
**Status:** ⬜ Not Started
**Objective:** Build the top-level React app shell, HUD header with window controls, centered status pill, and 2x2 metrics grid hooked to `window.api.onUpdate`.
**Depends on:** Phase 1

**Plans:**
- [ ] Plan 2.1: React shell, window controls, and IPC telemetry subscription
- [ ] Plan 2.2: Metrics grid and status pill with glassmorphic styling

---

### Phase 3: PingOscilloscope Canvas Integration & Polish
**Status:** ⬜ Not Started
**Objective:** Mount `PingOscilloscope.tsx`, connect live ping ticks and timeout drops into uPlot buffer, verify 60 FPS rendering, tooltips, and remove legacy unneeded files.
**Depends on:** Phase 2

**Plans:**
- [ ] Plan 3.1: Mount `PingOscilloscope.tsx` with live telemetry stream
- [ ] Plan 3.2: Visual verification, cleanup of legacy scripts, and final verification

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | 🔄 In Progress | 0/2 | 0% |
| 2 | ⬜ Not Started | 0/2 | 0% |
| 3 | ⬜ Not Started | 0/2 | 0% |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | 2026-10-22 | — | — |
| 2 | — | — | — |
| 3 | — | — | — |
