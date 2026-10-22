import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

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
  /** Rolling time-series sliding window in seconds (default: 60) */
  windowSec?: number;
  /** Locked Y-axis upper ceiling bound in ms (default: 120) */
  yMaxMs?: number;
  /** Playback delay buffer in seconds to prevent empty trailing edge (default: 2.0) */
  playbackDelaySec?: number;
  /** Target width in pixels (default: 316) */
  width?: number;
  /** Target height in pixels (default: 96) */
  height?: number;
  /** Optional container class name */
  className?: string;
  /** Target server label (default: "4.2.2.4") */
  serverTarget?: string;
}

/**
 * PingOscilloscope: Commercial-grade 60 FPS HTML5 Canvas Latency Streamer.
 * 
 * Powered by uPlot:
 * - High-DPI Canvas scaling (window.devicePixelRatio) for razor-sharp vector curves.
 * - useRef rolling FIFO queue (stores 60-120s of records) to prevent heavy React re-renders.
 * - Continuous requestAnimationFrame conveyor loop glides seamlessly from right to left.
 * - Instant vertical cliff drops to 0ms for timeouts in glowing neon red (#ff3366).
 * - Locked Y-axis bounds (0ms to 120ms) prevent dynamic stretching or jagged layout jumping.
 * - uPlot interaction crosshair with floating glassmorphic tooltip.
 */
export const PingOscilloscope: React.FC<PingOscilloscopeProps> = ({
  latestPing,
  windowSec = 60,
  yMaxMs = 120,
  playbackDelaySec = 2.0,
  width = 316,
  height = 96,
  className = '',
  serverTarget = '4.2.2.4',
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const uplotInstance = useRef<uPlot | null>(null);

  // 1. Fixed-Length Rolling Buffer in useRef (60s to 120s history)
  // Prevents heavy React component re-rendering on incoming ping events
  const pingBufferRef = useRef<PingRecord[]>([]);

  // Seed initial rolling buffer once on mount
  useEffect(() => {
    const now = Date.now() / 1000;
    const initialBuffer: PingRecord[] = [];
    const seedLength = Math.max(windowSec + 10, 70);

    for (let i = 0; i <= windowSec; i++) {
      const t = (now - windowSec - playbackDelaySec) + i * 1.0;
      const base = 20 + Math.sin(i * 0.35) * 6;
      initialBuffer.push({
        time: t,
        ping: parseFloat(base.toFixed(1)),
        isTimeout: false,
      });
    }
    pingBufferRef.current = initialBuffer;
  }, [windowSec, playbackDelaySec]);

  // 2. Initialize uPlot with Custom Canvas Oscilloscope Renderer
  useEffect(() => {
    if (!chartRef.current) return;

    // Custom Canvas Plugin: Gridlines + Neon Cyan Wave + Red 0ms Timeout Drops
    const oscilloscopePlugin: uPlot.Plugin = {
      hooks: {
        drawSeries: (u, seriesIdx) => {
          if (seriesIdx !== 1) return;

          const ctx = u.ctx;
          const bbox = u.bbox;
          const dpr = window.devicePixelRatio || 1;

          ctx.save();
          // Strictly clip rendering to uPlot plot area
          ctx.beginPath();
          ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height);
          ctx.clip();

          // A. Draw Faint Dark Horizontal Gridlines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1 * dpr;
          const gridSteps = [yMaxMs * 0.25, yMaxMs * 0.5, yMaxMs * 0.75];
          gridSteps.forEach((msVal) => {
            const y = u.valToPos(msVal, 'y', true);
            ctx.beginPath();
            ctx.moveTo(bbox.left, y);
            ctx.lineTo(bbox.left + bbox.width, y);
            ctx.stroke();
          });

          // B. Extract and Map Rolling Buffer Points
          const times = u.data[0];
          const pings = u.data[1];
          const n = times.length;
          if (n < 2) {
            ctx.restore();
            return;
          }

          const buf = pingBufferRef.current;
          const pts: { x: number; y: number; isTimeout: boolean; rawPing: number | null }[] = [];

          for (let i = 0; i < n; i++) {
            const x = u.valToPos(times[i], 'x', true);
            const isTimeout = buf[i] ? (buf[i].isTimeout ?? buf[i].ping === null) : (pings[i] ?? 0) === 0;
            const rawP = pings[i];
            const pingVal: number = (rawP !== null && rawP !== undefined) ? rawP : 0;
            const y = u.valToPos(pingVal, 'y', true);
            pts.push({ x, y, isTimeout, rawPing: buf[i]?.ping ?? pingVal });
          }

          const zeroY = u.valToPos(0, 'y', true);

          // C. Draw Glowing Semi-Transparent Gradient Area Fill Under Waveform
          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];

            const isTimeoutSeg = p1.isTimeout || p2.isTimeout;
            const grad = ctx.createLinearGradient(0, bbox.top, 0, zeroY);

            if (isTimeoutSeg) {
              grad.addColorStop(0, 'rgba(255, 51, 102, 0.28)');
              grad.addColorStop(1, 'rgba(255, 51, 102, 0.02)');
            } else {
              grad.addColorStop(0, 'rgba(0, 242, 254, 0.28)');
              grad.addColorStop(0.55, 'rgba(0, 242, 254, 0.07)');
              grad.addColorStop(1, 'rgba(10, 15, 26, 0)');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(p1.x, zeroY);
            ctx.lineTo(p1.x, p1.y);

            if (p2.isTimeout && !p1.isTimeout) {
              // Sudden vertical cliff drop to 0ms
              ctx.lineTo(p2.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            } else if (p1.isTimeout && !p2.isTimeout) {
              // Sharp vertical recovery from 0ms
              ctx.lineTo(p1.x, p2.y);
              ctx.lineTo(p2.x, p2.y);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }

            ctx.lineTo(p2.x, zeroY);
            ctx.closePath();
            ctx.fill();
          }

          // D. Draw Crisp 1.5px Vector Line with Sudden Drops & Recovery
          ctx.lineWidth = 1.6 * dpr;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];

            const isTimeoutSeg = p1.isTimeout || p2.isTimeout;
            const strokeColor = isTimeoutSeg ? '#ff3366' : '#00f2fe';

            ctx.strokeStyle = strokeColor;
            ctx.shadowColor = strokeColor;
            ctx.shadowBlur = (isTimeoutSeg ? 6 : 8) * dpr;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);

            if (p2.isTimeout && !p1.isTimeout) {
              // Sudden vertical cliff drop directly to 0ms
              ctx.lineTo(p2.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            } else if (p1.isTimeout && !p2.isTimeout) {
              // Sudden vertical recovery path
              ctx.lineTo(p1.x, p2.y);
              ctx.lineTo(p2.x, p2.y);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();
          }

          ctx.restore();
        },
      },
    };

    // Custom Interactive Tooltip Hook
    const tooltipPlugin: uPlot.Plugin = {
      hooks: {
        setCursor: (u) => {
          if (!tipRef.current) return;
          const { left, top, idx } = u.cursor;

          if (idx === null || idx === undefined || left === undefined || left < 0) {
            tipRef.current.style.display = 'none';
            return;
          }

          const rec = pingBufferRef.current[idx];
          if (!rec) {
            tipRef.current.style.display = 'none';
            return;
          }

          const isTimeout = rec.isTimeout || rec.ping === null;
          const timeStr = new Date(rec.time * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const valStr = isTimeout ? 'TIMEOUT (0 ms)' : `${rec.ping} ms`;

          tipRef.current.className = `uplot-tooltip ${isTimeout ? 'timeout' : ''}`;
          tipRef.current.innerHTML = `
            <div class="tip-val ${isTimeout ? 'timeout' : ''}">${valStr}</div>
            <div class="tip-time">${timeStr}</div>
          `;
          tipRef.current.style.display = 'block';

          // Clamp tooltip horizontally within viewport
          const clampedLeft = Math.max(46, Math.min(width - 46, left));
          tipRef.current.style.left = `${clampedLeft}px`;

          if (top !== undefined && top < 34) {
            tipRef.current.style.top = `${top + 22}px`;
            tipRef.current.style.transform = 'translate(-50%, 0)';
          } else if (top !== undefined) {
            tipRef.current.style.top = `${top}px`;
            tipRef.current.style.transform = 'translate(-50%, -125%)';
          }
        },
      },
    };

    // Configure uPlot Options: Locked Y-axis & Continuous Time Scale
    const initialTimes = pingBufferRef.current.map((p) => p.time);
    const initialPings = pingBufferRef.current.map((p) => (p.ping === null ? 0 : p.ping));

    const opts: uPlot.Options = {
      width,
      height,
      cursor: {
        show: true,
        x: true,
        y: false,
        points: {
          size: 7,
          fill: '#ffffff',
          stroke: '#00f2fe',
          width: 2,
        },
      },
      select: { show: false, left: 0, top: 0, width: 0, height: 0 },
      legend: { show: false },
      scales: {
        x: {
          time: true,
          auto: false,
          range: () => {
            const cur = Date.now() / 1000 - playbackDelaySec;
            return [cur - windowSec, cur];
          },
        },
        y: {
          auto: false,
          range: [0, yMaxMs], // Locked 0ms to 120ms: zero dynamic stretching
        },
      },
      axes: [{ show: false }, { show: false }],
      series: [
        {},
        {
          paths: () => null, // Managed by custom canvas drawSeries hook
          points: { show: false },
        },
      ],
      plugins: [oscilloscopePlugin, tooltipPlugin],
    };

    const plot = new uPlot(opts, [initialTimes, initialPings], chartRef.current);
    uplotInstance.current = plot;

    // 3. Continuous 60 FPS Oscilloscope Conveyor Loop
    let animId: number;
    const conveyorLoop = () => {
      const cur = Date.now() / 1000 - playbackDelaySec;
      plot.setScale('x', { min: cur - windowSec, max: cur });
      animId = requestAnimationFrame(conveyorLoop);
    };
    animId = requestAnimationFrame(conveyorLoop);

    return () => {
      cancelAnimationFrame(animId);
      plot.destroy();
      uplotInstance.current = null;
    };
  }, [width, height, windowSec, yMaxMs, playbackDelaySec]);

  // 4. Ingest incoming ping ticks into the rolling FIFO buffer without React re-renders
  useEffect(() => {
    if (!latestPing || !uplotInstance.current) return;

    const buf = pingBufferRef.current;
    let ts = latestPing.time || Date.now() / 1000;
    const lastT = buf.length > 0 ? buf[buf.length - 1].time : 0;
    if (ts <= lastT) ts = lastT + 0.05; // Strict monotonic ascending timestamps

    const isTimeout = latestPing.ping === null || latestPing.isTimeout === true;
    const cleanPing = isTimeout ? null : latestPing.ping;

    buf.push({
      time: ts,
      ping: cleanPing,
      isTimeout,
    });

    // Evict points older than sliding window + delay buffer + margin
    const cutoff = ts - (windowSec + playbackDelaySec + 10);
    while (buf.length > 2 && buf[0].time < cutoff) {
      buf.shift();
    }

    // Direct Canvas mutation: triggers instant sub-millisecond redraw with 0 React overhead
    const timesData = buf.map((p) => p.time);
    // Safe clamp between 0 and yMaxMs * 0.95 so spikes never clip off-screen
    const pingsData = buf.map((p) => {
      if (p.ping === null) return 0;
      return Math.min(yMaxMs * 0.95, Math.max(0, p.ping));
    });
    uplotInstance.current.setData([timesData, pingsData]);
  }, [latestPing, windowSec, playbackDelaySec]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        background: 'rgba(10, 15, 26, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '12px',
        cursor: 'crosshair',
      }}
      className={`wave-container ping-oscilloscope-widget ${className}`}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
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
          transform: 'translate(-50%, -125%)',
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
