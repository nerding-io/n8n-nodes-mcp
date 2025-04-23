import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class McpClientSseApi implements ICredentialType {
	name = 'mcpClientSseApi';
	displayName = 'MCP Client (SSE) API';

	// Cast the icon to the correct type for n8n
	icon = 'file:mcpClient.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'SSE URL',
			name: 'sseUrl',
			type: 'string',
			default: 'http://localhost:3001/sse',
			required: true,
			description: 'URL of the SSE endpoint for the MCP server',
		},
		{
			displayName: 'SSE Connection Timeout',
			name: 'sseTimeout',
			type: 'number',
			default: 60000,
			required: false,
			description: 'Timeout for the SSE connection in milliseconds. Default is 60 seconds.',
		},
		{
			displayName: 'Messages Post Endpoint',
			name: 'messagesPostEndpoint',
			type: 'string',
			default: '',
			description: 'Optional custom endpoint for posting messages (if different from SSE URL)',
		},
		{
			displayName: 'Additional Headers',
			name: 'headers',
			type: 'string',
			default: '',
			description: 'Additional headers to send in the request in NAME=VALUE format, separated by commas (e.g., BRAVE_API_KEY=xyz,OPENAI_API_KEY=abc)',
		},
	];
}
