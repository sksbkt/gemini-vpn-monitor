---
phase: 02-full-width-draggable-header-robust-windows-native-ping-engin
plan: 01
subsystem: ui-shell
tags:
  - electron
  - frameless-window
  - window-dragging
  - header
  - ui-ergonomics
dependency_graph:
  requires: []
  provides:
    - full-width-drag-header
    - strict-control-isolation
  affects:
    - window-interaction
    - desktop-ergonomics
tech-stack:
  added: []
  patterns:
    - Discord-style edge-to-edge draggable header container
    - Nested interactive control isolation with -webkit-app-region: no-drag !important
    - SVG pointer-events pass-through suppression
key-files:
  created: []
  modified:
    - styles.css
    - src/components/Header.tsx
    - test/test-shell-config.js
decisions:
  - "D-01: Expanded .card-header to width: 100% with -webkit-app-region: drag and pointer-events: none on .card-title for full-width Discord-style draggable ergonomics"
  - "D-02: Isolated .window-controls and .win-btn with -webkit-app-region: no-drag !important and pointer-events: none on child SVGs to prevent drag hijacking"
metrics:
  duration: 6m
  completed_date: "2026-10-31"
status: complete
actuals:
  tokens: 2028
  tasks: 2
  commits: 2
  plan_head_before: 39c4cd2bc47398b191ac52bffbf504f95bba1c33
  plan_head_after: 07125c0908c09cdf6a1a4c1bd9ab79cf8c351d45
---

# Phase 02 Plan 01: Full-Width Draggable Header Summary

Discord-style edge-to-edge draggable header ergonomics with strict interactive window control button isolation and static verification test coverage.

## Overview

Plan 02-01 refactored the desktop widget's top header from a narrow drag handle into a full-width edge-to-edge draggable header surface (`width: 100%`, `-webkit-app-region: drag`, and `cursor: grab`) across the top border. To prevent the full-width drag surface from swallowing interactive mouse clicks, `.window-controls` and `.win-btn` strictly enforce `-webkit-app-region: no-drag !important` alongside `pointer-events: none` on child SVGs. Passive title text in `.card-title` specifies `pointer-events: none` to enable fluid drag gestures passing directly through title text.

## Tasks Completed

| Task | Name | Commit | Key Files Modified |
|------|------|--------|-------------------|
| 1 | Establish full-width Discord-style draggable header layout and update test harness assertions | `eaa6533` | `styles.css`, `src/components/Header.tsx`, `test/test-shell-config.js` |
| 2 | Enforce strict controls isolation and build verification for window buttons and child SVGs | `07125c0` | `styles.css`, `src/components/Header.tsx`, `test/test-shell-config.js` |

## Key Changes Implemented

1. **Full-Width Edge-to-Edge Drag Surface (`styles.css` & `Header.tsx`):**
   - Configured `.card-header` with `width: 100%`, `display: flex`, `justify-content: space-between`, `-webkit-app-region: drag`, `cursor: grab`, and `user-select: none`.
   - Added `.card-header:active { cursor: grabbing; }`.
   - Wrapped `.card-title` in dedicated `.header-drag-zone` (`flex: 1`, `min-width: 0`, `-webkit-app-region: drag`).
   - Declared `pointer-events: none` on `.card-title` so drag gestures seamlessly pass through the text without text selection interference.

2. **Strict Window Controls Isolation (`styles.css` & `Header.tsx`):**
   - Set `-webkit-app-region: no-drag !important` and `cursor: default` on `.window-controls`.
   - Maintained `-webkit-app-region: no-drag !important` and `cursor: pointer` on `.win-btn`.
   - Set `pointer-events: none` on `.win-btn svg` so vector geometry cannot capture coordinates or trigger OS window drag gestures.
   - Cleaned up markup and preserved all control buttons (`#settingsBtn`, `#pinBtn`, `#minBtn`, `#closeBtn`) with accessible titles and event bindings.

3. **Expanded Test Assertions (`test/test-shell-config.js`):**
   - Verified `.card-header` declares `-webkit-app-region: drag`, `width: 100%`, and `cursor: grab`.
   - Verified `.header-drag-zone` declares `-webkit-app-region: drag`.
   - Verified `.card-title` declares `pointer-events: none`.
   - Verified `.window-controls` and `.win-btn` declare `-webkit-app-region: no-drag !important`.
   - Verified `.win-btn svg` declares `pointer-events: none`.

## Verification Results

- `node test/test-shell-config.js` executed with exit code 0 (all shell configuration and drag region tests passed).
- `cmd /c "npm run build && npm test"` completed with zero TypeScript errors, Vite bundle generated cleanly, and both IPC contract and shell configuration test suites passing 100%.

## Deviations from Plan

None - plan executed exactly as written.

## Threat Model Validation

- **T-02-01 (Denial of Service - Window drag swallows control clicks):** Mitigated by `-webkit-app-region: no-drag !important` on `.window-controls` / `.win-btn` and `pointer-events: none` on child SVGs.
- **T-02-02 (Tampering - Window control button actions):** Mitigated by preserving strictly typed IPC trigger handlers without exposing generic IPC send.
- **T-02-SC (Supply Chain Tampering):** Mitigated by introducing zero new third-party dependencies.

## Known Stubs

None. All header buttons, drag regions, and styling properties are fully wired and functional.

## Self-Check: PASSED

- FOUND: `styles.css`
- FOUND: `src/components/Header.tsx`
- FOUND: `test/test-shell-config.js`
- FOUND: `eaa6533` (feat(02-01): establish full-width Discord-style draggable header layout)
- FOUND: `07125c0` (feat(02-01): enforce strict window controls isolation and assertions)
