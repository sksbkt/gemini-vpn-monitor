const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const readline = require('readline');

// Windows CMD Ping output patterns:
// "Reply from 4.2.2.4: bytes=32 time=42ms TTL=54" -> 42
// "Reply from 4.2.2.4: bytes=32 time<1ms TTL=54"  -> 1
// "Request timed out."                             -> null (packet loss)
// "Destination host unreachable."                  -> null
// "General failure."                               -> null
const LATENCY_REGEX = /time[=<](\d+)\s*ms/i;
const SUB_MILLISECOND_REGEX = /time<1\s*ms/i;
const TIMEOUT_REGEX = /(?:request timed out|destination host unreachable|general failure|transmit failed)/i;

function sanitizeTarget(target) {
  if (typeof target !== 'string') return null;
  const trimmed = target.trim();
  if (!trimmed || trimmed.length > 255) return null;
  if (/^[a-zA-Z0-9.-]+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

class PingEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.target = sanitizeTarget(options.target) || '4.2.2.4';
    this.intervalMs = typeof options.intervalMs === 'number' ? Math.max(500, Math.min(5000, options.intervalMs)) : 1000;
    this.child = null;
    this.rl = null;
    this.isRunning = false;
    this.restartTimer = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._spawnProcess();
  }

  _spawnProcess() {
    if (!this.isRunning) return;

    // Use continuous ping stream: ping <target> -t on Windows (or ping <target> on unix)
    const isWin = process.platform === 'win32';
    const args = isWin ? [this.target, '-t'] : [this.target];

    try {
      this.child = spawn('ping', args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Stream line reader ensures chunks are reassembled cleanly without boundary fragmentation per D-04
      this.rl = readline.createInterface({
        input: this.child.stdout,
        crlfDelay: Infinity
      });

      this.rl.on('line', (line) => {
        this._parseLine(line);
      });

      this.child.on('error', (err) => {
        this.emit('error', err);
      });

      this.child.on('exit', (code, signal) => {
        this.child = null;
        if (this.rl) {
          this.rl.close();
          this.rl = null;
        }
        if (this.isRunning) {
          // Automatic recovery / respawn if process unexpectedly terminates
          this.restartTimer = setTimeout(() => {
            this._spawnProcess();
          }, 1000);
        }
      });
    } catch (err) {
      this.emit('error', err);
    }
  }

  _parseLine(line) {
    if (!line || typeof line !== 'string') return;
    const trimmed = line.trim();
    if (!trimmed) return;

    // 1. Check for standard latency reply
    const latencyMatch = trimmed.match(LATENCY_REGEX);
    if (latencyMatch) {
      const ms = parseInt(latencyMatch[1], 10);
      this.emit('ping', {
        target: this.target,
        latency: ms,
        isTimeout: false,
        timestamp: Date.now()
      });
      return;
    }

    // 2. Check for sub-millisecond response: time<1ms
    if (SUB_MILLISECOND_REGEX.test(trimmed)) {
      this.emit('ping', {
        target: this.target,
        latency: 1,
        isTimeout: false,
        timestamp: Date.now()
      });
      return;
    }

    // 3. Check for genuine network timeouts / drops
    if (TIMEOUT_REGEX.test(trimmed)) {
      this.emit('ping', {
        target: this.target,
        latency: null,
        isTimeout: true,
        timestamp: Date.now()
      });
      return;
    }

    // Non-packet lines (e.g., "Pinging 4.2.2.4 with 32 bytes of data:") are safely ignored without false drops
  }

  setTarget(newTarget) {
    const validated = sanitizeTarget(newTarget);
    if (!validated || validated === this.target) return;
    this.target = validated;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    if (this.child) {
      try {
        this.child.kill();
      } catch (e) {}
      this.child = null;
    }
  }
}

module.exports = {
  PingEngine,
  LATENCY_REGEX,
  SUB_MILLISECOND_REGEX,
  TIMEOUT_REGEX
};
