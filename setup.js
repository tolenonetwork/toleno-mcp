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
// Returns an array of all possible config paths so we can write to ALL of them.
// This ensures both classic (EXE) and Windows Store (MSIX) installs are covered.
function getConfigPaths() {
    const platform = process.platform;
    const home = process.env.HOME || process.env.USERPROFILE || '';

    if (platform === 'win32') {
        const paths = [];

        // 1) Windows Store (MSIX) kurulumu
        const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
        const packagesDir = path.join(localAppData, 'Packages');
        if (fs.existsSync(packagesDir)) {
            try {
                const entries = fs.readdirSync(packagesDir);
                const claudePackage = entries.find(e => e.startsWith('Claude_'));
                if (claudePackage) {
                    paths.push(path.join(packagesDir, claudePackage, 'LocalCache', 'Roaming', 'Claude', 'claude_desktop_config.json'));
                }
            } catch {}
        }

        // 2) Klasik kurulum (Program Files / EXE installer)
        const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
        paths.push(path.join(appData, 'Claude', 'claude_desktop_config.json'));

        return paths;
    }
    if (platform === 'darwin') {
        return [path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')];
    }
    // Linux
    const configDir = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return [path.join(configDir, 'Claude', 'claude_desktop_config.json')];
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

    // 3) Find all config paths (both Store and classic on Windows)
    const configPaths = getConfigPaths();
    const SERVER_KEY = 'Toleno Network';
    const mcpEntry = {
        command: 'npx',
        args: ['-y', '@toleno/mcp'],
        env: { TOLENO_API_KEY: apiKey }
    };

    let writtenCount = 0;

    for (const configPath of configPaths) {
        const configDir = path.dirname(configPath);
        console.log(`  Config: ${configPath}`);

        // 4) Read existing config or create new
        let config = {};
        if (fs.existsSync(configPath)) {
            try {
                const raw = fs.readFileSync(configPath, 'utf-8');
                config = JSON.parse(raw);
            } catch (err) {
                console.log(`    ⚠ Could not parse — skipping (${err.message})`);
                continue;
            }
        } else {
            // Ensure directory exists
            try {
                fs.mkdirSync(configDir, { recursive: true });
            } catch {
                console.log(`    ⚠ Could not create directory — skipping`);
                continue;
            }
        }

        // 5) Add/update Toleno entry
        if (!config.mcpServers) config.mcpServers = {};
        const hadExisting = !!config.mcpServers[SERVER_KEY];
        config.mcpServers[SERVER_KEY] = mcpEntry;

        // 6) Write config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
        console.log(`    ✓ ${hadExisting ? 'Updated' : 'Added'}`);
        writtenCount++;
    }

    if (writtenCount === 0) {
        console.error('\n  ✗ Could not write to any Claude Desktop config file.');
        process.exit(1);
    }

    console.log('');
    console.log(`  ✓ Wrote to ${writtenCount} config file${writtenCount > 1 ? 's' : ''}`);
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
