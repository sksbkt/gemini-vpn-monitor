const assert = require('assert');
const { PingEngine, LATENCY_REGEX, SUB_MILLISECOND_REGEX, TIMEOUT_REGEX } = require('../pingEngine');

console.log('--- Running Windows-Native Ping Engine Unit Tests ---');

// Test 1: Parser regex accuracy on Windows CMD sample lines
const sampleReplies = [
  { line: 'Reply from 4.2.2.4: bytes=32 time=42ms TTL=54', expectedLatency: 42, isTimeout: false },
  { line: 'Reply from 1.1.1.1: bytes=32 time=8ms TTL=58', expectedLatency: 8, isTimeout: false },
  { line: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128', expectedLatency: 1, isTimeout: false },
  { line: 'Reply from 192.168.1.1: bytes=32 time<1 ms TTL=64', expectedLatency: 1, isTimeout: false },
  { line: 'Reply from 8.8.8.8: bytes=32 time=0ms TTL=118', expectedLatency: 0, isTimeout: false },
  { line: 'Request timed out.', expectedLatency: null, isTimeout: true },
  { line: 'Destination host unreachable.', expectedLatency: null, isTimeout: true },
  { line: 'General failure.', expectedLatency: null, isTimeout: true },
  { line: 'Transmit failed. General failure.', expectedLatency: null, isTimeout: true },
  { line: 'Pinging 4.2.2.4 with 32 bytes of data:', expectedLatency: undefined, isTimeout: undefined },
  { line: 'Ping statistics for 4.2.2.4:', expectedLatency: undefined, isTimeout: undefined },
  { line: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),', expectedLatency: undefined, isTimeout: undefined },
  { line: 'Approximate round trip times in milli-seconds:', expectedLatency: undefined, isTimeout: undefined },
  { line: '    Minimum = 35ms, Maximum = 42ms, Average = 38ms', expectedLatency: undefined, isTimeout: undefined },
  { line: '', expectedLatency: undefined, isTimeout: undefined },
  { line: '   ', expectedLatency: undefined, isTimeout: undefined }
];

for (const sample of sampleReplies) {
  let emitted = null;
  const engine = new PingEngine({ target: '4.2.2.4' });
  engine.on('ping', (data) => { emitted = data; });
  engine._parseLine(sample.line);

  if (sample.expectedLatency === undefined) {
    assert.strictEqual(emitted, null, `Banner header/summary "${sample.line}" must not emit ping event`);
  } else {
    assert.notStrictEqual(emitted, null, `Line "${sample.line}" must emit ping event`);
    assert.strictEqual(emitted.target, '4.2.2.4');
    assert.strictEqual(emitted.latency, sample.expectedLatency);
    assert.strictEqual(emitted.isTimeout, sample.isTimeout);
    assert.strictEqual(typeof emitted.timestamp, 'number');
  }
}
console.log('✓ Test 1: Windows CMD line parsing correctly extracts latency, sub-ms, timeouts, and ignores headers');

// Test 2: Chunk boundary fragmentation simulation
const engine = new PingEngine({ target: '4.2.2.4' });
const receivedPings = [];
engine.on('ping', (p) => receivedPings.push(p));

const chunkLines = [
  'Reply from 4.2.2.4: bytes=32 time=35ms TTL=54',
  'Reply from 4.2.2.4: bytes=32 time=36ms TTL=54',
  'Request timed out.',
  'Reply from 4.2.2.4: bytes=32 time<1ms TTL=54'
];
chunkLines.forEach(l => engine._parseLine(l));

assert.strictEqual(receivedPings.length, 4);
assert.strictEqual(receivedPings[0].latency, 35);
assert.strictEqual(receivedPings[0].isTimeout, false);
assert.strictEqual(receivedPings[1].latency, 36);
assert.strictEqual(receivedPings[1].isTimeout, false);
assert.strictEqual(receivedPings[2].latency, null);
assert.strictEqual(receivedPings[2].isTimeout, true);
assert.strictEqual(receivedPings[3].latency, 1);
assert.strictEqual(receivedPings[3].isTimeout, false);
console.log('✓ Test 2: Simulated line feed processes sequential reply types reliably');

// Test 3: Multi-target independence & isolation (Phase 3 readiness)
const engineA = new PingEngine({ target: '4.2.2.4' });
const engineB = new PingEngine({ target: '1.1.1.1' });
assert.strictEqual(engineA.target, '4.2.2.4');
assert.strictEqual(engineB.target, '1.1.1.1');

let emittedA = null;
let emittedB = null;
engineA.on('ping', (p) => { emittedA = p; });
engineB.on('ping', (p) => { emittedB = p; });

engineA._parseLine('Reply from 4.2.2.4: bytes=32 time=20ms TTL=54');
engineB._parseLine('Reply from 1.1.1.1: bytes=32 time=10ms TTL=58');

assert.strictEqual(emittedA.target, '4.2.2.4');
assert.strictEqual(emittedA.latency, 20);
assert.strictEqual(emittedB.target, '1.1.1.1');
assert.strictEqual(emittedB.latency, 10);
console.log('✓ Test 3: Multi-target instances maintain strict event and property isolation');

// Test 4: Dynamic target change via setTarget()
const engineDynamic = new PingEngine({ target: '4.2.2.4' });
assert.strictEqual(engineDynamic.target, '4.2.2.4');
engineDynamic.setTarget('8.8.8.8');
assert.strictEqual(engineDynamic.target, '8.8.8.8');
// Target with invalid characters should be ignored
engineDynamic.setTarget('bad;target&evil');
assert.strictEqual(engineDynamic.target, '8.8.8.8');
console.log('✓ Test 4: Dynamic setTarget() validates input and updates target cleanly');

// Test 5: Exported Regex checks
assert(LATENCY_REGEX.test('time=42ms'));
assert(LATENCY_REGEX.test('time=0ms'));
assert(SUB_MILLISECOND_REGEX.test('time<1ms'));
assert(TIMEOUT_REGEX.test('Request timed out.'));
assert(TIMEOUT_REGEX.test('Destination host unreachable.'));
assert(TIMEOUT_REGEX.test('General failure.'));
console.log('✓ Test 5: Exported regex patterns match all CMD specifications');

console.log('ALL PING ENGINE TESTS PASSED');
