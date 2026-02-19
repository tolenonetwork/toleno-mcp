#!/usr/bin/env node
/**
 * Toleno MCP — Auto Setup for Claude Desktop
 *
 * Finds the Claude Desktop config file, adds the Toleno MCP server entry,
 * and writes it back. No manual JSON editing needed.
 *
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// ── Config file paths per OS ─────────────────────────────────────────────────
function getConfigPath() {
    const platform = process.platform;
    const home = process.env.HOME || process.env.USERPROFILE || '';

    if (platform === 'win32') {
        const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
        return path.join(appData, 'Claude', 'claude_desktop_config.json');
    }
    if (platform === 'darwin') {
        return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    }
    // Linux
    const configDir = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return path.join(configDir, 'Claude', 'claude_desktop_config.json');
}

// ── API key validation ───────────────────────────────────────────────────────
function validateApiKey(apiKey) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.tolenocoin.com',
            path: '/api/auth/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
}

// ── Interactive prompt ───────────────────────────────────────────────────────
function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// ── Main setup ───────────────────────────────────────────────────────────────
async function setup() {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   Toleno × Claude — Auto Setup       ║');
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');

    // 1) Get API key
    const args = process.argv.slice(2);
    const keyIdx = args.indexOf('--key');
    let apiKey = keyIdx >= 0 ? (args[keyIdx + 1] || '') : '';

    if (!apiKey) {
        console.log('  You need a Toleno API key to connect Claude to your account.');
        console.log('  Get one: Toleno App → Settings → API Keys → Create New Key');
        console.log('');
        apiKey = await ask('  Enter your API key (tlno_...): ');
    }

    if (!apiKey.startsWith('tlno_')) {
        console.error('\n  ✗ Invalid key — must start with "tlno_"');
        process.exit(1);
    }

    // 2) Validate key
    process.stdout.write('  Validating API key... ');
    const valid = await validateApiKey(apiKey);
    if (!valid) {
        console.log('✗');
        console.error('  Invalid or expired API key. Check your key and try again.');
        process.exit(1);
    }
    console.log('✓');

    // 3) Find config file
    const configPath = getConfigPath();
    const configDir = path.dirname(configPath);
    console.log(`  Config file: ${configPath}`);

    // 4) Read existing config or create new
    let config = {};
    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf-8');
            config = JSON.parse(raw);
            console.log('  Existing config found — merging...');
        } catch (err) {
            console.error(`\n  ✗ Could not parse existing config: ${err.message}`);
            console.error('  Please fix the JSON manually or delete the file and retry.');
            process.exit(1);
        }
    } else {
        console.log('  No existing config — creating new...');
        // Ensure directory exists
        fs.mkdirSync(configDir, { recursive: true });
    }

    // 5) Add/update Toleno entry
    if (!config.mcpServers) {
        config.mcpServers = {};
    }

    const SERVER_KEY = 'Toleno Network';
    const hadExisting = !!config.mcpServers[SERVER_KEY];
    config.mcpServers[SERVER_KEY] = {
        command: 'npx',
        args: ['-y', '@toleno/mcp'],
        env: {
            TOLENO_API_KEY: apiKey
        }
    };

    // 6) Write config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    console.log('');
    console.log(`  ✓ ${hadExisting ? 'Updated' : 'Added'} Toleno MCP server to Claude Desktop config`);
    console.log('');
    console.log('  ┌─────────────────────────────────────────┐');
    console.log('  │  Now restart Claude Desktop to connect!  │');
    console.log('  │  Look for the 🔨 hammer icon in chat.   │');
    console.log('  └─────────────────────────────────────────┘');
    console.log('');
    console.log('  Try asking Claude: "What is my Toleno mining status?"');
    console.log('');
}

module.exports = { setup };

// Run directly if called as script
if (require.main === module) {
    setup().catch(err => {
        console.error(`\n  Fatal error: ${err.message}`);
        process.exit(1);
    });
}
