# MCP Client Tool Schema Truncation Bug: Problem & Solution

## 1. **Background**

The `n8n-nodes-mcp` project provides an MCP Client node for n8n that connects to MCP servers and exposes their tools to workflows and AI agents. One of its operations, `listTools`, fetches the available tools from an MCP server and exposes their parameter schemas for UI and validation.

## 2. **Problem Statement**

When using the MCP Client node to connect to an MCP server and call the `listTools` operation, the returned schema for each tool is **truncated**—it only includes the top-level properties and omits nested details, constraints, enums, and other critical schema information.

**Example:**
- The schema for a tool like `fg_findPersons` only shows `queries` as an array, but does not show the structure of the objects inside that array (e.g., `fg_id`, `emailExact`, etc.).
- By contrast, other clients (e.g., Claude Desktop) correctly fetch the full, deeply-nested schema from the same MCP server.

## 3. **Root Cause Analysis**

- The MCP Client node fetches tool definitions from the server, which include the original JSON Schema for tool parameters.
- The code then **converts the original JSON Schema into a Zod object**, and subsequently **converts it back into JSON Schema** using `zodToJsonSchema`.
- This double conversion is **lossy**: Zod cannot represent all JSON Schema features, so information like nested object structures, enums, constraints, and defaults is lost.
- The resulting schema is degraded and incomplete, causing downstream issues with parameter validation, UI, and workflow execution.

## 4. **Evidence**

- The bug is documented in [GitHub issue #129](https://github.com/nerding-io/n8n-nodes-mcp/issues/129), which describes the exact problem and root cause.
- Code review of `/nodes/McpClient/McpClient.node.ts` confirms that the schema is being converted from JSON Schema → Zod → JSON Schema, causing the loss.

## 5. **Impact**

- Users cannot rely on parameter defaults, constraints, or validation.
- Complex or nested tool parameters become unusable.
- Workflows may fail or behave unpredictably.
- Poor developer and user experience.

## 6. **Solution**

### **Design Principle**

**Preserve the original JSON Schema from the MCP server.**  
Do not convert it to Zod and back. Pass it through as-is in the `listTools` output.

### **Code Change Summary**

- **Current (buggy) code:**  
  ```typescript
  tools: aiTools.map((t: DynamicStructuredTool) => ({
      name: t.name,
      description: t.description,
      schema: zodToJsonSchema(t.schema as z.ZodTypeAny || z.object({})),
  }))
  ```
  - Here, `t.schema` is a Zod object created from the original JSON Schema, and `zodToJsonSchema` attempts to convert it back, causing information loss.

- **Proposed fix:**  
  When building the tool list, **use the original JSON Schema from the MCP server directly**:
  ```typescript
  const aiTools = tools.map((tool: any) => ({
      name: tool.name,
      description: tool.description || `Execute the ${tool.name} tool`,
      schema: tool.inputSchema || {type: 'object', properties: {}, additionalProperties: false},
      func: async (params) => { /* ... */ }
  }));
  ```
  - When returning the tool list, simply return `schema: tool.inputSchema`.

### **Steps to Implement**

1. **Locate the code** in `/nodes/McpClient/McpClient.node.ts` that handles the `listTools` operation and builds the tool schema.
2. **Remove the Zod conversion:**  
   - Do not convert the server’s JSON Schema to Zod object.
   - Do not use `zodToJsonSchema` for the `listTools` output.
3. **Return the original JSON Schema** (`tool.inputSchema`) as received from the MCP server.
4. **Test:**  
   - Write a unit test that mocks a tool with a complex, nested JSON Schema.
   - Assert that the returned schema from `listTools` is identical to the original schema.
   - Optionally, run an integration test against a real MCP server with complex schemas.

### **Testing Example**

Here is a unit test skeleton you can use:

```typescript
import { McpClient } from '../nodes/McpClient/McpClient.node';
// ...other imports

describe('MCP Client Tool Schema Serialization', () => {
  it('should return the full, original JSON Schema for a tool', async () => {
    const originalSchema = {
      type: 'object',
      properties: {
        queries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fg_id: { type: 'string', format: 'uuid' },
              emailExact: { type: 'string', format: 'email' },
              // ...more fields
            },
            required: ['fg_id'],
            additionalProperties: false
          }
        }
      },
      required: ['queries'],
      additionalProperties: false
    };

    // Mock the MCP server/tools response
    const fakeTool = {
      name: 'fg_findPersons',
      description: 'Find persons based on an array of criteria.',
      inputSchema: originalSchema
    };

    // Simulate your listTools logic here
    const aiTools = [fakeTool].map(tool => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema
    }));

    // Assert the schema is identical
    expect(aiTools[0].schema).toEqual(originalSchema);
  });
});
```

## 7. **References**

- [GitHub Issue #129: Bug: Massive schema information loss in listTools operation due to unnecessary double conversion](https://github.com/nerding-io/n8n-nodes-mcp/issues/129)
- File to update: `/nodes/McpClient/McpClient.node.ts`
- Function/operation: `listTools` (and any place where tool schemas are exposed to the UI or consumers)

## 8. **Summary Table**

| Step                        | Action                                                                                 |
|-----------------------------|----------------------------------------------------------------------------------------|
| Identify code               | `/nodes/McpClient/McpClient.node.ts` – `listTools` operation                          |
| Remove conversion           | Do not convert server JSON Schema to Zod and back                                      |
| Pass schema through         | Use `tool.inputSchema` as the schema in the output                                     |
| Write test                  | Assert that the returned schema matches the original, including nested properties      |
| Validate with server/client | Optionally, test with a real MCP server and compare with a working client (e.g. Claude)|

---

**This document should give any engineer the full context, root cause, and clear implementation steps to fix and validate the MCP Client schema truncation bug.**  
If you need a PR template or further test scaffolding, let me know!
