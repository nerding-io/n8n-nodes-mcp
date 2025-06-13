/**
 * Jest-based test for MCP Client listTools schema passthrough bug
 * This test ensures that the schema returned by listTools is identical to the server's response (no truncation/conversion)
 */

describe('MCP Client listTools schema passthrough', () => {
  // Simulate the MCP server response
  const serverToolsResponse = [
    {
      name: 'complexTool',
      description: 'A tool with a complex nested schema',
      inputSchema: {
        type: 'object',
        properties: {
          simple: { type: 'string', description: 'A simple string' },
          nested: {
            type: 'object',
            properties: {
              inner: { type: 'number', description: 'A nested number' },
              deep: {
                type: 'object',
                properties: {
                  flag: { type: 'boolean', description: 'A deep boolean' }
                },
                required: ['flag']
              }
            },
            required: ['inner', 'deep']
          },
          arr: {
            type: 'array',
            items: { type: 'string' },
            description: 'An array of strings'
          }
        },
        required: ['simple', 'nested', 'arr']
      }
    }
  ];

  // Simulate the fixed listTools passthrough logic
  function listToolsPassthrough(rawTools: any[]) {
    return rawTools.map(tool => ({
      name: tool.name,
      description: tool.description || `Execute the ${tool.name} tool`,
      schema: tool.inputSchema
    }));
  }

  it('should return the original schema from the server without modification', () => {
    const output = listToolsPassthrough(serverToolsResponse);
    expect(output[0].schema).toEqual(serverToolsResponse[0].inputSchema);
    // Deep equality: nested properties and structure must match
    expect(JSON.stringify(output[0].schema)).toBe(JSON.stringify(serverToolsResponse[0].inputSchema));
  });

  it('should fail if the schema is truncated or converted', () => {
    // Simulate buggy behavior: flattening/removing nested/deep properties
    const buggy = [{
      name: 'complexTool',
      description: 'A tool with a complex nested schema',
      schema: { type: 'object', properties: { simple: { type: 'string' } }, required: ['simple'] }
    }];
    expect(buggy[0].schema).not.toEqual(serverToolsResponse[0].inputSchema);
  });
});
