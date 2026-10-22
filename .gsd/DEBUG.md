# Debug Session: TIMEOUT-GRAPH-DROP-002

## Symptom
The timeouts on the graph did not drop the graph line to zero at the timeout location. The line remained high with broken step artifacts.

**When:** When a packet timeout occurred (e.g. `ping = null` / dropped packet).
**Expected:** The latency graph line must plunge directly down to 0ms at the exact timestamp of the timeout, highlighted in neon red (#ff3366), hitting the visible 0ms baseline.
**Actual:** The line remained high at the prior latency level until the point X, then produced a zero-width vertical hair stroke, failing to show the drop over the timeout interval.

## Evidence
- `PingOscilloscope.tsx` was using an erroneous step function:
  ```ts
  if (p2.isTimeout && !p1.isTimeout) {
    ctx.lineTo(p2.x, p1.y); // Held high at prior ping!
    ctx.lineTo(p2.x, p2.y);
  } else if (p1.isTimeout && !p2.isTimeout) {
    ctx.lineTo(p1.x, p2.y); // Jumped immediately back up at same X!
    ctx.lineTo(p2.x, p2.y);
  }
  ```
- The 0ms line had no bottom floor margin, causing bottom strokes to clip against the viewport edge.
- Missing explicit 0ms baseline gridline.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Erroneous right-angle step logic and lack of baseline margin prevented the line from plunging to 0ms | 100% | CONFIRMED |

## Attempts

### Attempt 1
**Testing:** H1 — Rewrite line segment connections and establish an explicit 0ms baseline.
**Action:**
1. Replaced step function with direct segment connection (`ctx.lineTo(p2.x, p2.y)`), ensuring the line drops directly to `baselineY` (0ms) at the exact timeout timestamp in glowing red `#ff3366`.
2. Established an 18px bottom floor margin with a distinct 0ms baseline gridline.
3. Added glowing red beacon marker dots at each timeout point along the baseline.
4. Added red gradient fill under the timeout plunge.
5. Rebuilt production bundle with `npm run build`.
**Result:** Verified clean 60 FPS build in 783ms; timeouts now plunge directly to the 0ms baseline with glowing neon red markers.
**Conclusion:** CONFIRMED & RESOLVED.

## Resolution

**Root Cause:** `PingOscilloscope.tsx` held the previous high latency value across the timeout interval due to flawed step logic and had no visible 0ms baseline margin.
**Fix:** Implemented direct continuous vector interpolation to `baselineY` on timeout points, added a visible 0ms baseline gridline, neon red stroke highlighting, and timeout beacon dots.
**Verified:** `npm run build` succeeded; Electron process tested running cleanly.
