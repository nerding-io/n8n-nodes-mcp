import { parseHeaders, mergeHeaders } from '../utils';

describe('MCP Client Utils', () => {
	describe('parseHeaders', () => {
		it('should parse newline-separated NAME=VALUE headers', () => {
			const input = 'Authorization=Bearer token123\nContent-Type=application/json';
			const result = parseHeaders(input);
			expect(result).toEqual({
				Authorization: 'Bearer token123',
				'Content-Type': 'application/json',
			});
		});

		it('should handle headers with equals signs in values', () => {
			const input = 'Api-Key=abc=def=ghi';
			const result = parseHeaders(input);
			expect(result).toEqual({
				'Api-Key': 'abc=def=ghi',
			});
		});

		it('should ignore empty lines and malformed entries', () => {
			const input = 'Valid-Header=value\n\n=NoKey\nNoEquals\nAnother-Header=value2';
			const result = parseHeaders(input);
			expect(result).toEqual({
				'Valid-Header': 'value',
				'Another-Header': 'value2',
			});
		});

		it('should trim whitespace from keys and values', () => {
			const input = '  Authorization  =  Bearer token  \n  Content-Type  =  application/json  ';
			const result = parseHeaders(input);
			expect(result).toEqual({
				Authorization: 'Bearer token',
				'Content-Type': 'application/json',
			});
		});

		it('should handle empty string input', () => {
			const result = parseHeaders('');
			expect(result).toEqual({});
		});

		it('should handle multiple headers with various formats', () => {
			const input =
				'X-Api-Key=secret123\nAuthorization=Bearer xyz\nX-Custom-Header=value=with=equals';
			const result = parseHeaders(input);
			expect(result).toEqual({
				'X-Api-Key': 'secret123',
				Authorization: 'Bearer xyz',
				'X-Custom-Header': 'value=with=equals',
			});
		});
	});

	describe('mergeHeaders', () => {
		it('should merge credential and override headers', () => {
			const credentialHeaders = {
				'X-Api-Key': 'from-credentials',
				'Content-Type': 'application/json',
			};
			const overrideHeaders = {
				Authorization: 'Bearer override-token',
			};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({
				'X-Api-Key': 'from-credentials',
				'Content-Type': 'application/json',
				Authorization: 'Bearer override-token',
			});
		});

		it('should allow override headers to take precedence over credential headers', () => {
			const credentialHeaders = {
				Authorization: 'Bearer credential-token',
				'X-Custom': 'credential-value',
			};
			const overrideHeaders = {
				Authorization: 'Bearer override-token',
			};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({
				Authorization: 'Bearer override-token',
				'X-Custom': 'credential-value',
			});
		});

		it('should handle empty override headers', () => {
			const credentialHeaders = {
				Authorization: 'Bearer token',
			};
			const overrideHeaders = {};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({
				Authorization: 'Bearer token',
			});
		});

		it('should handle empty credential headers', () => {
			const credentialHeaders = {};
			const overrideHeaders = {
				Authorization: 'Bearer token',
			};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({
				Authorization: 'Bearer token',
			});
		});

		it('should handle both empty headers objects', () => {
			const credentialHeaders = {};
			const overrideHeaders = {};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({});
		});

		it('should merge multiple headers correctly', () => {
			const credentialHeaders = {
				'X-Api-Key': 'cred-key',
				'Content-Type': 'application/json',
				Accept: 'application/json',
			};
			const overrideHeaders = {
				Authorization: 'Bearer new-token',
				'Content-Type': 'text/plain',
			};
			const result = mergeHeaders(credentialHeaders, overrideHeaders);
			expect(result).toEqual({
				'X-Api-Key': 'cred-key',
				'Content-Type': 'text/plain',
				Accept: 'application/json',
				Authorization: 'Bearer new-token',
			});
		});
	});
});
