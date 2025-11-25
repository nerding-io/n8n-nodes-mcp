# PR: Fix MCP Client Schema Truncation Bug (`listTools`)

## Overview
This PR addresses a critical bug in the MCP Client (`McpClient.node.ts`) where the JSON schema for tools returned by the MCP server was being converted to Zod and then back to JSON Schema, causing loss of information, especially for nested or complex schemas. The fix ensures that the original server schema (`tool.inputSchema`) is passed through unchanged.

## Root Cause
- The previous implementation reconstructed the schema using Zod, which does not support all JSON Schema features and can flatten or drop nested properties.
- This led to incomplete or incorrect schemas being returned to clients, breaking downstream integrations and validation.

## Solution
- **Direct passthrough:** The code now returns the original `tool.inputSchema` from the server for each tool, with no conversion or mapping.
- **Debug Logging:** Added debug-level logs for received and returned schemas for traceability.
- **Error Handling:** All logic is wrapped in root-level try/catch blocks with pretty-printed error logs, per project guidelines.

## Testing
- **Unit Test:** Added `nodes/McpClient/listTools.schema.test.ts` which:
  - Mocks a complex/nested server schema.
  - Asserts that the returned schema matches the original (deep equality).
  - Demonstrates failure if the old buggy approach is used.
- **Test Results:** All tests pass, confirming the bug is fixed.

## Impact
- No breaking changes to API or interface.
- Downstream consumers will now receive the full, correct schema as provided by the MCP server.

## How to Validate
1. Run `npx vitest run nodes/McpClient/listTools.schema.test.ts` to verify the test suite.
2. (Optional) Validate with a real MCP server and compare with a known-good client.

## References
- See `schemabug.md` for root cause analysis, steps, and context.

---

**Reviewer Checklist:**
- [ ] Code follows project error handling and logging guidelines
- [ ] Test covers regression and deep schema equality
- [ ] No unnecessary code conversion or mapping remains
- [ ] Documentation (this PR template and `schemabug.md`) is clear and complete

---

If you need additional context, see the included `schemabug.md` or request further test scaffolding.
