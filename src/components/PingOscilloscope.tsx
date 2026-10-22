import React, { useEffect, useRef } from 'react';

export interface PingRecord {
  /** Timestamp in seconds (e.g. Date.now() / 1000) */
  time: number;
  /** Latency in milliseconds, or null if timeout / dropped */
  ping: number | null;
  /** Optional flag indicating timeout */
  isTimeout?: boolean;
}

export interface PingOscilloscopeProps {
  /** Latest incoming ping record */
  latestPing?: PingRecord;
  /** Rolling time-series sliding window in seconds (default: 14) */
  windowSec?: number;
  /** Playback delay buffer in seconds to prevent empty trailing edge (default: 2.0) */
  playbackDelaySec?: number;
  /** Target width in pixels (default: 300) */
  width?: number;
  /** Target height in pixels (default: 96) */
  height?: number;
  /** Optional container class name */
  className?: string;
  /** Target server label (default: "4.2.2.4") */
  serverTarget?: string;
}

/**
 * PingOscilloscope: High-Performance 60 FPS HTML5 Canvas Latency Streamer.
 * 
 * - Continuous 60 FPS requestAnimationFrame conveyor loop.
 * - Razor-sharp high-DPI scaling (window.devicePixelRatio).
 * - Direct cliff-drop to 0ms baseline for timeouts in glowing neon red (#ff3366).
 * - Dynamic ceiling so high latency spikes (150-400ms) never clip off-screen.
 * - Visible 0ms baseline gridline with red timeout beacon markers.
 * - Interactive mouse hover cursor snapping with glassmorphic tooltip.
 */
export const PingOscilloscope: React.FC<PingOscilloscopeProps> = ({
  latestPing,
  windowSec = 14,
  playbackDelaySec = 2.0,
  width = 300,
  height = 96,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  // Rolling FIFO buffer of timestamped ping records
  const pingBufferRef = useRef<PingRecord[]>([]);

  // Hover state for interactive inspection
  const hoverRef = useRef<{ active: boolean; x: number }>({ active: false, x: -1 });

  // Format timestamp to localized time string
  const formatTime = (tsSec: number) => {
    const d = new Date(tsSec * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Seed baseline points on mount covering past window duration
  useEffect(() => {
    const now = Date.now() / 1000;
    const initial: PingRecord[] = [];
    const seedVals = [96, 102, 95, 108, 102, 94, 112, 105, 96, 100, 95, 104, 98, 97, 101, 99, 103, 98];

    for (let i = 0; i < seedVals.length; i++) {
      const t = now - windowSec - playbackDelaySec + i * 1.0;
      initial.push({
        time: t,
        ping: seedVals[i],
        isTimeout: false,
      });
    }
    pingBufferRef.current = initial;
  }, [windowSec, playbackDelaySec]);

  // Ingest incoming ping events into FIFO buffer
  useEffect(() => {
    if (!latestPing) return;

    const buf = pingBufferRef.current;
    let ts = latestPing.time || Date.now() / 1000;
    const lastT = buf.length > 0 ? buf[buf.length - 1].time : 0;
    if (ts <= lastT) ts = lastT + 0.05; // Enforce strict monotonic timestamps

    const isTimeout = latestPing.ping === null || latestPing.isTimeout === true;
    const cleanPing = isTimeout ? null : latestPing.ping;

    buf.push({
      time: ts,
      ping: cleanPing,
      isTimeout,
    });

    // Prune points that have scrolled off-screen
    const cutoff = ts - (windowSec + playbackDelaySec + 6);
    while (buf.length > 2 && buf[0].time < cutoff) {
      buf.shift();
    }
  }, [latestPing, windowSec, playbackDelaySec]);

  // 60 FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = width;
      const h = height;

      // Sync canvas dimensions with display pixels
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.clearRect(0, 0, w * dpr, h * dpr);

      // Layout geometry
      const paddingTop = 14 * dpr;
      const paddingBottom = 18 * dpr;
      const baselineY = h * dpr - paddingBottom; // 0ms Baseline Y (approx y = 78 on 96h)
      const plotH = baselineY - paddingTop;       // Vertical plot range

      // 1. Draw Gridlines
      ctx.lineWidth = 1 * dpr;
      // Top gridline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, paddingTop);
      ctx.lineTo(w * dpr, paddingTop);
      ctx.stroke();

      // Middle gridline
      ctx.beginPath();
      ctx.moveTo(0, paddingTop + plotH * 0.5);
      ctx.lineTo(w * dpr, paddingTop + plotH * 0.5);
      ctx.stroke();

      // ZERO BASELINE Gridline (Faint glowing guide at 0ms)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(w * dpr, baselineY);
      ctx.stroke();

      // 2. Compute Dynamic Ceiling so high pings never clip
      const buf = pingBufferRef.current;
      const validPings = buf
        .filter((p) => !p.isTimeout && p.ping !== null && p.ping > 0)
        .map((p) => p.ping!);
      const maxVal = validPings.length > 0 ? Math.max(...validPings) : 120;
      const ceiling = Math.max(160, maxVal * 1.25);

      const calcY = (val: number | null, isTimeout: boolean) => {
        if (isTimeout || val === null || val === 0) {
          return baselineY; // Timeouts DROP DIRECTLY TO ZERO BASELINE!
        }
        const pct = Math.min(0.95, Math.max(0.08, val / ceiling));
        return baselineY - pct * plotH;
      };

      // 3. Map buffer to screen coordinates based on current continuous conveyor time
      const renderTime = Date.now() / 1000 - playbackDelaySec;
      const speed = (w * dpr) / windowSec;

      const screenPts = buf
        .map((p) => {
          const x = w * dpr - (renderTime - p.time) * speed;
          const isTimeout = p.isTimeout || p.ping === null;
          const y = calcY(p.ping, isTimeout);
          return {
            x,
            y,
            ping: p.ping,
            isTimeout,
            time: p.time,
          };
        })
        .sort((a, b) => a.x - b.x);

      // Filter visible points with boundary margin
      const visible = screenPts.filter((p) => p.x >= -60 * dpr && p.x <= w * dpr + 60 * dpr);

      if (visible.length >= 2) {
        // A. Draw Gradient Area Fill Under Waveform
        for (let i = 0; i < visible.length - 1; i++) {
          const p1 = visible[i];
          const p2 = visible[i + 1];
          const isTimeoutSeg = p1.isTimeout || p2.isTimeout;

          const grad = ctx.createLinearGradient(0, paddingTop, 0, baselineY);
          if (isTimeoutSeg) {
            grad.addColorStop(0, 'rgba(255, 51, 102, 0.32)');
            grad.addColorStop(0.65, 'rgba(255, 51, 102, 0.08)');
            grad.addColorStop(1, 'rgba(10, 15, 26, 0)');
          } else {
            grad.addColorStop(0, 'rgba(0, 242, 254, 0.28)');
            grad.addColorStop(0.55, 'rgba(0, 242, 254, 0.07)');
            grad.addColorStop(1, 'rgba(10, 15, 26, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(p1.x, baselineY);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p2.x, baselineY);
          ctx.closePath();
          ctx.fill();
        }

        // B. Draw Razor-Sharp Latency Line with Glowing Stroke
        for (let i = 0; i < visible.length - 1; i++) {
          const p1 = visible[i];
          const p2 = visible[i + 1];
          const isTimeoutSeg = p1.isTimeout || p2.isTimeout;

          const strokeColor = isTimeoutSeg ? '#ff3366' : '#00f2fe';

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y); // Direct connection: plunges to baselineY on timeout!

          ctx.strokeStyle = strokeColor;
          ctx.shadowColor = strokeColor;
          ctx.shadowBlur = (isTimeoutSeg ? 8 : 6) * dpr;
          ctx.lineWidth = (isTimeoutSeg ? 2.2 : 1.8) * dpr;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        // C. Draw Beacon Dot at Timeout Baseline Locations
        visible.forEach((p) => {
          if (p.isTimeout && p.x >= 0 && p.x <= w * dpr) {
            ctx.beginPath();
            ctx.arc(p.x, baselineY, 3.2 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 10 * dpr;
            ctx.fill();

            // Inner white core
            ctx.beginPath();
            ctx.arc(p.x, baselineY, 1.4 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        });

        // D. Interactive Hover Marker Snapping
        const hover = hoverRef.current;
        if (hover.active && hover.x >= 0 && hover.x <= w && tipRef.current) {
          const hx = hover.x * dpr;
          let activeIdx = -1;

          for (let i = 0; i < visible.length - 1; i++) {
            if (hx >= visible[i].x && hx <= visible[i + 1].x) {
              activeIdx = i;
              break;
            }
          }

          if (activeIdx !== -1) {
            const p1 = visible[activeIdx];
            const p2 = visible[activeIdx + 1];
            const dx = p2.x - p1.x;
            const t = dx === 0 ? 0 : (hx - p1.x) / dx;
            const hy = p1.y + t * (p2.y - p1.y);

            const nearest = Math.abs(hx - p1.x) < Math.abs(hx - p2.x) ? p1 : p2;
            const isTimeout = nearest.isTimeout || p1.isTimeout || p2.isTimeout;
            const hoverColor = isTimeout ? '#ff3366' : '#00f2fe';

            // Draw cursor snap circle on canvas
            ctx.beginPath();
            ctx.arc(hx, hy, 6 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = hoverColor;
            ctx.globalAlpha = 0.35;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.beginPath();
            ctx.arc(hx, hy, 2.8 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Update floating tooltip
            const tip = tipRef.current;
            const valText = isTimeout ? 'TIMEOUT (0 ms)' : `${nearest.ping} ms`;
            const timeText = formatTime(nearest.time);

            tip.className = `uplot-tooltip ${isTimeout ? 'timeout' : ''}`;
            tip.innerHTML = `
              <div class="tip-val ${isTimeout ? 'timeout' : ''}">${valText}</div>
              <div class="tip-time">${timeText}</div>
            `;
            tip.style.display = 'block';

            const normLeft = Math.max(52, Math.min(width - 52, hover.x));
            tip.style.left = `${normLeft}px`;

            const normY = hy / dpr;
            if (normY < 44) {
              // High latency points (upper half of graph): display tooltip below the cursor point
              tip.style.top = `${normY + 14}px`;
              tip.style.transform = 'translate(-50%, 0)';
            } else {
              // Lower latency points (lower half of graph): display tooltip above the cursor point
              tip.style.top = `${normY - 12}px`;
              tip.style.transform = 'translate(-50%, -100%)';
            }
          } else if (tipRef.current) {
            tipRef.current.style.display = 'none';
          }
        } else if (tipRef.current) {
          tipRef.current.style.display = 'none';
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height, windowSec, playbackDelaySec]);

  // Handle Mouse Events for Hover Snapping
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    hoverRef.current = {
      active: true,
      x: Math.max(0, Math.min(width, (rawX / rect.width) * width)),
    };
  };

  const handleMouseLeave = () => {
    hoverRef.current = { active: false, x: -1 };
    if (tipRef.current) {
      tipRef.current.style.display = 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'visible',
        borderRadius: '12px',
        background: 'rgba(10, 15, 26, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        margin: '0 auto 12px auto',
        cursor: 'crosshair',
        zIndex: 10,
      }}
      className={`wave-container ping-oscilloscope-widget ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'block',
          borderRadius: '12px',
        }}
      />
      <div
        ref={tipRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(0, 242, 254, 0.5)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          padding: '5px 10px',
          display: 'none',
          zIndex: 999,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(12px)',
        }}
      />
    </div>
  );
};

export default PingOscilloscope;
