/**
 * Parse headers from newline-separated NAME=VALUE format
 */
export function parseHeaders(headerString: string): Record<string, string> {
	const headers: Record<string, string> = {};
	if (headerString) {
		const headerLines = headerString.split('\n');
		for (const line of headerLines) {
			const equalsIndex = line.indexOf('=');
			// Ensure '=' is present and not the first character of the line
			if (equalsIndex > 0) {
				const name = line.substring(0, equalsIndex).trim();
				const value = line.substring(equalsIndex + 1).trim();
				// Add to headers object if key is not empty and value is defined
				if (name && value !== undefined) {
					headers[name] = value;
				}
			}
		}
	}
	return headers;
}

/**
 * Merge headers from credentials with dynamic headers
 * Dynamic headers take precedence over credential headers
 */
export function mergeHeaders(
	credentialHeaders: Record<string, string>,
	dynamicHeaders: Record<string, string>,
): Record<string, string> {
	return { ...credentialHeaders, ...dynamicHeaders };
}
