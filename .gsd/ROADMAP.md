---
milestone: Settings & Custom Target Configuration
version: 1.2.0
updated: 2026-10-22T19:54:55+03:30
---

# Roadmap

> **Current Milestone**: Settings & Custom Target Configuration (v1.2.0)
> **Goal**: Add a persistent configuration subsystem and glassmorphic settings modal to customize ping targets, intervals, and timeouts dynamically.

## Must-Haves (from SPEC)

- [ ] JSON configuration storage in `userData/config.json` with fallback defaults
- [ ] Two-way IPC channels (`settings:get`, `settings:save`) with shell sanitization
- [ ] Dynamic poller reconfiguration in `main.js` without restarting the application
- [ ] Glassmorphic Settings Modal with IP/host input, DNS presets, interval slider, and reset
- [ ] Clean TypeScript integration across `vite-env.d.ts` and React components

---

## Phases

### Phase 1: Settings Store & Dynamic Poller IPC
**Status:** ✅ Complete
**Objective:** Implement persistent config file management in `main.js`, shell sanitization, two-way IPC handlers (`settings:get`, `settings:save`), and dynamic runtime reconfiguration of the ping poller loop.
**Requirements:** `userData/config.json`, sanitized target IP input, dynamic interval/timeout tuning.

**Plans:**
- [x] Plan 1.1: Persistent configuration manager and sanitized IPC handlers
- [x] Plan 1.2: Dynamic runtime reconfiguration of main ping monitoring loop

---

### Phase 2: Glassmorphic Settings Modal UI & Presets
**Status:** ⬜ Not Started
**Objective:** Add a settings gear button in `Header.tsx` and create `SettingsModal.tsx` with DNS quick-presets, interval slider, validation, and glassmorphic styling.
**Depends on:** Phase 1

**Plans:**
- [ ] Plan 2.1: Settings modal component with quick presets, interval slider, and form validation
- [ ] Plan 2.2: Modal styling, transitions, and integration with `Header.tsx` and `App.tsx`

---

### Phase 3: End-to-End Verification & Production Build
**Status:** ⬜ Not Started
**Objective:** Validate on-the-fly target switching, settings persistence across app restarts, zero-regression build checks, and milestone verification.
**Depends on:** Phase 2

**Plans:**
- [ ] Plan 3.1: Verify dynamic target switching and disk persistence
- [ ] Plan 3.2: Full production build, process launch testing, and milestone audit

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ Complete | 2/2 | 100% |
| 2 | ⬜ Not Started | 0/2 | 0% |
| 3 | ⬜ Not Started | 0/2 | 0% |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | 2026-10-22 | 2026-10-22 | <1d |
| 2 | — | — | — |
| 3 | — | — | — |
