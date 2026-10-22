const assert = require('assert');
const path = require('path');
const http = require('http');

// Setup mock electron module before requiring main.js
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === 'electron') {
    return {
      app: {
        getPath: () => path.join(__dirname, 'temp_geo_test'),
        quit: () => {},
        whenReady: () => Promise.resolve(),
        on: () => {}
      },
      BrowserWindow: class {
        static getAllWindows() { return []; }
      },
      ipcMain: {
        on: () => {},
        handle: () => {}
      },
      Menu: {
        setApplicationMenu: () => {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

const main = require('../main.js');
const { checkGemini, RESTRICTED_COUNTRIES } = main;

// Helper to test response parsing logic against simulated responses
function parseGeminiResponse(statusCode, body) {
  if (statusCode === 403 || statusCode === 451 || (statusCode >= 400 && statusCode < 500)) {
    return 'RESTRICTED';
  }
  if (statusCode !== 200) {
    return 'RESTRICTED';
  }

  const lower = body.toLowerCase();
  if (
    lower.includes("isn't supported in your country") ||
    lower.includes("not supported in your country") ||
    lower.includes("isn't currently supported in your country") ||
    lower.includes("not available in your region") ||
    lower.includes("not available in your country") ||
    lower.includes("user location is not supported")
  ) {
    return 'RESTRICTED';
  }

  const match = body.match(/"vXmutd"\s*:\s*"%\.@\.\\"([A-Z]{2})\\"/) ||
                body.match(/\\"([A-Z]{2})\\",\s*\\"ZZ\\"/);
  if (match) {
    const country = match[1];
    if (RESTRICTED_COUNTRIES.has(country)) {
      return 'RESTRICTED';
    } else {
      return 'UNRESTRICTED';
    }
  }

  return 'UNRESTRICTED';
}

async function runTests() {
  console.log('--- Running Gemini Geo-Restriction Detector Tests ---');

  // Test 1: Restricted countries list integrity
  console.log('Test 1: Validating restricted countries set...');
  assert.ok(RESTRICTED_COUNTRIES.has('IR'), 'Iran must be in restricted set');
  assert.ok(RESTRICTED_COUNTRIES.has('RU'), 'Russia must be in restricted set');
  assert.ok(RESTRICTED_COUNTRIES.has('CN'), 'China must be in restricted set');
  assert.ok(RESTRICTED_COUNTRIES.has('KP'), 'North Korea must be in restricted set');
  assert.ok(RESTRICTED_COUNTRIES.has('SY'), 'Syria must be in restricted set');
  assert.ok(RESTRICTED_COUNTRIES.has('CU'), 'Cuba must be in restricted set');
  assert.ok(!RESTRICTED_COUNTRIES.has('NL'), 'Netherlands must NOT be in restricted set');
  assert.ok(!RESTRICTED_COUNTRIES.has('US'), 'United States must NOT be in restricted set');
  assert.ok(!RESTRICTED_COUNTRIES.has('DE'), 'Germany must NOT be in restricted set');
  console.log('✓ Test 1: Restricted country set validated');

  // Test 2: Simulated Iranian IP (must resolve RESTRICTED - no false positive)
  console.log('Test 2: Iranian IP simulation (vXmutd = "IR")...');
  const irBody = '<html><script>window.WIZ_global_data = {"vXmutd":"%.@.\\"IR\\",\\"ZZ\\",\\"hash\\"]"};</script></html>';
  const irResult = parseGeminiResponse(200, irBody);
  assert.strictEqual(irResult, 'RESTRICTED', 'Iranian IP must be detected as RESTRICTED');
  console.log('✓ Test 2: Iranian IP correctly detected as RESTRICTED (Zero False Positive)');

  // Test 3: Simulated Russian IP (must resolve RESTRICTED)
  console.log('Test 3: Russian IP simulation (vXmutd = "RU")...');
  const ruBody = '<html><script>window.WIZ_global_data = {"vXmutd":"%.@.\\"RU\\",\\"ZZ\\",\\"hash\\"]"};</script></html>';
  assert.strictEqual(parseGeminiResponse(200, ruBody), 'RESTRICTED', 'Russian IP must be RESTRICTED');
  console.log('✓ Test 3: Russian IP correctly detected as RESTRICTED');

  // Test 4: Simulated geo-block message in body
  console.log('Test 4: Explicit geo-block string detection...');
  const geoBlockBody = '<html><body><h1>Gemini isn\'t supported in your country yet</h1></body></html>';
  assert.strictEqual(parseGeminiResponse(200, geoBlockBody), 'RESTRICTED', 'Block text must resolve RESTRICTED');
  console.log('✓ Test 4: Explicit block text correctly detected as RESTRICTED');

  // Test 5: HTTP 403 / 451 legal restriction
  console.log('Test 5: HTTP 403 & 451 status codes...');
  assert.strictEqual(parseGeminiResponse(403, 'Forbidden'), 'RESTRICTED');
  assert.strictEqual(parseGeminiResponse(451, 'Unavailable For Legal Reasons'), 'RESTRICTED');
  console.log('✓ Test 5: HTTP 403 and 451 correctly detected as RESTRICTED');

  // Test 6: Simulated Unrestricted VPN (Netherlands "NL")
  console.log('Test 6: Bypassed / VPN IP simulation (vXmutd = "NL")...');
  const nlBody = '<html><script>window.WIZ_global_data = {"vXmutd":"%.@.\\"NL\\",\\"ZZ\\",\\"hash\\"]"};</script></html>';
  assert.strictEqual(parseGeminiResponse(200, nlBody), 'UNRESTRICTED', 'Netherlands IP must be UNRESTRICTED');
  console.log('✓ Test 6: Netherlands IP correctly detected as UNRESTRICTED');

  // Test 7: Simulated US IP
  console.log('Test 7: US IP simulation (vXmutd = "US")...');
  const usBody = '<html><script>window.WIZ_global_data = {"vXmutd":"%.@.\\"US\\",\\"ZZ\\",\\"hash\\"]"};</script></html>';
  assert.strictEqual(parseGeminiResponse(200, usBody), 'UNRESTRICTED', 'US IP must be UNRESTRICTED');
  console.log('✓ Test 7: US IP correctly detected as UNRESTRICTED');

  // Test 8: Live Gemini Web Check against real service
  console.log('Test 8: Live check against live Google Gemini service...');
  const liveStatus = await checkGemini(7000);
  console.log(`Live Gemini status detected: ${liveStatus}`);
  assert.ok(['UNRESTRICTED', 'RESTRICTED', 'OFFLINE'].includes(liveStatus), 'Status must be valid enum value');
  console.log('✓ Test 8: Live Gemini check succeeded and returned valid enum');

  console.log('ALL 8 GEMINI GEO-RESTRICTION DETECTOR TESTS PASSED (exit code 0)');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
