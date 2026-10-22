# Debug Session: Graph Alignment & Tooltip Clipping

## Symptom
1. The oscilloscope graph window was not horizontally centered inside the widget card (it overflowed to the right with 20px left padding vs 4px right margin).
2. The ping hover tooltip was clipped/cut off on higher parts of the graph (when ping latency points were in the upper region of the graph).

**When:** Hovering over high ping values, and viewing the widget card layout.
**Expected:**
- The graph window must be horizontally centered with exact 20px margins on both sides, matching the header and metrics grid.
- The tooltip must always be completely visible without clipping, even for high ping spikes or edge coordinates.
**Actual:**
- Graph was 316px wide inside a 300px inner card space, overflowing 16px to the right and appearing misaligned (20px left padding vs 4px right margin).
- The graph container had `overflow: hidden`, and tooltip positioning used a rigid `translate(-50%, -125%)` when `normY >= 32`, placing the top of the tooltip outside the container bounds where it got sliced off.

## Resolution

**Root Cause:**
1. The oscilloscope canvas container was assigned a hardcoded width of `316px` in `App.tsx` and `PingOscilloscope.tsx`, while the widget card's inner content width is `300px` (340px card - 40px horizontal padding). Because flex items align to start by default without auto margins, this pushed the graph 16px rightward, creating an asymmetric 20px left vs 4px right gap.
2. The oscilloscope container had `overflow: hidden`, which sliced off the floating tooltip whenever points were in the upper half of the canvas (`normY` between 32px and 48px).

**Fix:**
1. Changed `PingOscilloscope` width from `316px` to `300px` in `src/App.tsx` and updated the default prop in `src/components/PingOscilloscope.tsx`.
2. Centered the graph container with `margin: '0 auto 12px auto'`, `max-width: 300px`, and `align-self: center`.
3. Set `overflow: visible` on `.wave-container` in `styles.css` and `PingOscilloscope.tsx`, giving it `z-index: 10` so the tooltip can float freely without being cut off.
4. Added `borderRadius: '12px'` to the `<canvas>` element so the background wave still retains smooth rounded corners.
5. Improved dynamic tooltip placement: when a hover point is in the upper half (`normY < 44`), the tooltip flips below the point with 14px padding; when in the lower half, it floats above with safe boundary clamping.
6. Rebuilt production bundle (`npm run build`).

**Verified:**
- TypeScript type-check and Vite production build passed cleanly.
- Unit and integration tests passed (`test-settings-poller.js`, `test-e2e-persistence.js`, `test-ipc-contract.js`).
- Electron process launch smoke test passed (`ELECTRON_LAUNCH_SMOKE_TEST_PASS`).

**Status:** FIXED
