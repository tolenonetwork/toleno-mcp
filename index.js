#!/usr/bin/env node
/**
 * Toleno Network MCP Server
 * Transport: stdio (Claude Desktop & Claude Code compatible)
 *
 * Usage:
 *   npx @toleno/mcp
 *
 */

// ── CLI routing: "npx @toleno/mcp setup" → auto-install to Claude Desktop ────
const cliCommand = process.argv[2];
if (cliCommand === 'setup' || cliCommand === 'install') {
    const { setup } = require('./setup');
    setup().catch(err => {
        console.error(`Fatal error: ${err.message}`);
        process.exit(1);
    });
    return;
}

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const TolenoClient = require('./client');
const TolenoPublicClient = require('./client-public');

const statsTools   = require('./tools/stats');
const miningTools  = require('./tools/mining');
const walletTools  = require('./tools/wallet');
const profileTools = require('./tools/profile');
const referralTools = require('./tools/referral');
const infoTools    = require('./tools/info');

// Tools that work without an API key
const PUBLIC_TOOLS = new Set([
    'get_global_stats', 'get_leaderboard',
    'get_project_info', 'get_tokenomics', 'get_roadmap', 'get_security_info', 'get_faq'
]);

async function main() {
    const apiKey = process.env.TOLENO_API_KEY;

    const authClient   = apiKey ? new TolenoClient(apiKey) : null;
    const publicClient = new TolenoPublicClient();

    const server = new Server(
        { name: 'Toleno Network', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    const allTools = [
        ...statsTools.definitions,
        ...miningTools.definitions,
        ...walletTools.definitions,
        ...profileTools.definitions,
        ...referralTools.definitions,
        ...infoTools.definitions
    ];

    const allHandlers = {
        ...statsTools.handlers,
        ...miningTools.handlers,
        ...walletTools.handlers,
        ...profileTools.handlers,
        ...referralTools.handlers,
        ...infoTools.handlers
    };

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: allTools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (!PUBLIC_TOOLS.has(name) && !authClient) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: 'TOLENO_API_KEY is not configured. Go to Toleno App → Settings → API Keys → Create New Key, then add it to your MCP config.'
                    }, null, 2)
                }],
                isError: true
            };
        }

        const handler = allHandlers[name];
        if (!handler) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` }, null, 2)
                }],
                isError: true
            };
        }

        try {
            const client = PUBLIC_TOOLS.has(name) ? publicClient : authClient;
            const result = await handler(client, args || {});
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message || 'Unknown error',
                        status: error.status || 500,
                        details: error.data || null
                    }, null, 2)
                }],
                isError: true
            };
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(err => {
    process.stderr.write(`Fatal error: ${err.message}\n`);
    process.exit(1);
});
