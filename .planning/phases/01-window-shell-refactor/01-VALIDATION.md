---
phase: "01"
slug: "window-shell-refactor"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-31"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node:assert` & `node:test` runner |
| **Config file** | `package.json` |
| **Quick run command** | `node test/test-ipc-contract.js` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `node test/test-ipc-contract.js`
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SHELL-01 | T-01-01 | Secure BrowserWindow flags without remote module | unit | `node test/test-shell-config.js` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | SHELL-01 | T-01-02 | DWM hardware acceleration disablement & initial pin sync | unit | `node test/test-shell-config.js` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | SHELL-02 | T-01-03 | Valid draggable CSS regions (-webkit-app-region: drag) | static / unit | `node test/test-shell-config.js` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | SHELL-03 | T-01-04 | Isolated no-drag buttons, pointer-events: none on SVGs | static & contract | `node test/test-ipc-contract.js` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/test-shell-config.js` — Automated verification of `BrowserWindow` options and `styles.css` drag/no-drag rules
- [ ] Add `"test": "node test/test-ipc-contract.js && node test/test-shell-config.js"` to `package.json` scripts
- [ ] Extend `test/test-ipc-contract.js` to assert `window:close` and `window:minimize` IPC registrations

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native OS Titlebar Removal | SHELL-01 | Visual rendering in Windows DWM desktop compositor | Run `npm start`, confirm no titlebar or OS window frame exists |
| Smooth Desktop Dragging | SHELL-02 | Physical mouse drag interaction across screen coordinates | Click and hold on header title/upper handle, drag around screen |
| Window Controls Ergonomics | SHELL-03 | Interactive click handling on no-drag buttons | Click Pin, Settings, Minimize, and Close buttons to verify immediate execution |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-10-31

