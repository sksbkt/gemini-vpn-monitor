# Debug Session: False Positive Gemini UNRESTRICTED Detection

## Symptom
The application displayed the `UNRESTRICTED` status message even when connected from restricted geographic regions (e.g., Iran, Russia, China) or when no VPN was active to bypass Google's restrictions.

**When:** App is running without a VPN or when restrictions are not bypassed.
**Expected:** The widget must notify `UNRESTRICTED` ONLY when the connection has successfully bypassed Google's geo-restrictions and can genuinely access Google Gemini. Otherwise, it must display `RESTRICTED` (or `OFFLINE` if unreachable).
**Actual:** The status pill falsely reported `UNRESTRICTED` 100% of the time, even when completely un-proxied in an unsupported country.

## Resolution

**Root Cause:**
1. In `main.js`, `checkGemini()` sent an HTTPS GET to `https://generativelanguage.googleapis.com/v1beta/models?key=vpn_check_ping` with a dummy API key (`vpn_check_ping`).
2. Google's API Gateway checks API key validity *before* performing any regional or geo-ip access checks. Because `vpn_check_ping` is not a valid key, Google's server always returns HTTP 400 with `API_KEY_INVALID` ("API key not valid. Please pass a valid API key.") regardless of whether the request originates from the US, Netherlands, Iran, Russia, or anywhere else in the world.
3. The previous implementation contained:
   ```javascript
   else if (body.includes('API_KEY_INVALID') || body.includes('API key not valid') || res.statusCode === 200) {
     resolve('UNRESTRICTED');
   }
   ```
   This caused the checker to unconditionally treat `API_KEY_INVALID` as `UNRESTRICTED`, resulting in permanent false positives.
4. `currentGeminiStatus` was initialized to `'UNRESTRICTED'` before the first check even executed.

**Fix:**
1. Replaced the dummy API key call with a live inspection of Google's official Gemini consumer service endpoint (`https://gemini.google.com/`).
2. Implemented parsing of Google's server-rendered `WIZ_global_data` (`vXmutd` 2-letter ISO country code), which reflects Google's actual live geolocation of the client's connection (e.g. `"NL"`, `"DE"`, `"US"`, `"IR"`, `"RU"`).
3. Created an explicit `RESTRICTED_COUNTRIES` set (`IR`, `RU`, `CN`, `KP`, `SY`, `CU`, `BY`) and text scanners for Google's geo-block phrases (`"isn't supported in your country"`, `"not supported in your country"`, etc.).
4. Configured `maxHeaderSize: 65536` on the HTTPS client to accommodate Google's extensive security and CSP headers without `HPE_HEADER_OVERFLOW`.
5. Updated initial status in [main.js](file:///e:/Electron/gemini-vpn-monitor/main.js) to `'RESTRICTED'` until an active check passes.
6. Created [test/test-gemini-geo-checker.js](file:///e:/Electron/gemini-vpn-monitor/test/test-gemini-geo-checker.js) containing 8 unit and integration tests covering Iranian IP, Russian IP, geo-block text, HTTP 403/451, Netherlands/US IPs, and live service checks.
7. Rebuilt production assets with `npm run build`.

**Verified:**
- All 8 unit tests in `test/test-gemini-geo-checker.js` passed (including verification of zero false positives on Iranian/Russian IPs).
- All existing unit and integration test suites passed (`test-settings-poller.js`, `test-e2e-persistence.js`, `test-ipc-contract.js`).
- Electron process launch smoke test passed (`ELECTRON_LAUNCH_SMOKE_TEST_PASS`).

**Status:** FIXED
