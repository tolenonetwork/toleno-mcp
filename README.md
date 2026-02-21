# @toleno/mcp

[![npm version](https://img.shields.io/npm/v/@toleno/mcp.svg)](https://www.npmjs.com/package/@toleno/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@toleno/mcp.svg)](https://www.npmjs.com/package/@toleno/mcp)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-compatible-orange)](https://modelcontextprotocol.io)

**Toleno Network MCP Server** — Control your Toleno mining account directly from Claude AI using natural language.

> Check balance · Start mining · View referrals — all without opening the app.

---

<!--
  📹 DEMO GIF — Kayıt talimatı:
  1. Claude Desktop'u aç
  2. "What is my Toleno mining status?" yaz
  3. Yanıtı göster
  demo.gif olarak bu klasöre kaydet, sonra aşağıdaki satırı aktif et:
-->
<!-- ![Toleno MCP Demo](https://raw.githubusercontent.com/tolenonetwork/toleno-mcp/main/demo.gif) -->

---

## Quick Start

```bash
npx @toleno/mcp setup
```

The setup wizard will:
1. Ask for your Toleno API key
2. Validate it against the Toleno API
3. Automatically update your Claude Desktop config
4. Remind you to restart Claude Desktop

Or non-interactive:

```bash
npx @toleno/mcp setup --key tlno_your_key_here
```

---

## Get Your API Key

1. Open the **Toleno app** on your phone
2. Go to **Settings → API Keys**
3. Tap **"Create New Key"**
4. Name it (e.g. `Claude Desktop`)
5. **Copy it immediately** — starts with `tlno_`, shown only once

---

## Manual Setup

### Claude Desktop

| OS | Config file |
|----|-------------|
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "Toleno Network": {
      "command": "npx",
      "args": ["-y", "@toleno/mcp"],
      "env": {
        "TOLENO_API_KEY": "tlno_paste_your_key_here"
      }
    }
  }
}
```

### Claude Code

Add `.mcp.json` to your project root:

```json
{
  "mcpServers": {
    "Toleno Network": {
      "command": "npx",
      "args": ["-y", "@toleno/mcp"],
      "env": {
        "TOLENO_API_KEY": "tlno_paste_your_key_here"
      }
    }
  }
}
```

---

## Available Tools

| Tool | What it does | Needs key? |
|------|-------------|------------|
| `get_global_stats` | Total tokens mined, platform-wide user count | No |
| `get_profile` | Your balance, mining power, streak, level | Yes |
| `get_mining_status` | Active session, time remaining, tokens earned | Yes |
| `start_mining` | Start a new 24-hour mining session | Yes |
| `claim_mining` | Claim rewards after a completed session | Yes |
| `get_wallet_info` | Wallet address, withdrawable balance, limits | Yes |
| `get_referral_info` | Referral code, team size, active referrals | Yes |

---

## What You Can Ask Claude

```
"What is my Toleno mining status?"
"Start mining"
"How many TOL tokens do I have?"
"Show my wallet info"
"How many referrals do I have?"
"What are the global Toleno stats?"
"When does my mining session end?"
```

---

## Example Session

```
You:    What is my mining status?

Claude: Your mining session is active!
        ⛏  Started: 3 hours ago
        ⏱  Time remaining: 21 hours
        💰 Earned so far: 3.5 / 28 TOL
        ✅ Keep it running to earn the full reward!

---

You:    How many referrals do I have?

Claude: Your referral stats:
        👥 Total referrals: 12
        ✅ Active today: 7
        🔗 Your code: TOLENO-ABC123
```

---

## FAQ

**Q: Is my API key safe?**
Your key is stored locally in the Claude config file — never sent to Claude's servers. Revoke it anytime from the Toleno app.

**Q: Can Claude do anything harmful to my account?**
No. Claude can only read data, start mining sessions, and claim completed rewards. It cannot change your wallet address, withdraw tokens, or delete your account.

**Q: The tools don't appear in Claude Desktop.**
Fully quit and restart Claude Desktop after setup. Look for the 🔨 hammer icon in the chat toolbar.

**Q: Do I need Node.js?**
Yes, Node.js 18 or higher. Download from [nodejs.org](https://nodejs.org).

**Q: It says "TOLENO_API_KEY is not configured".**
Run `npx @toleno/mcp setup` again or manually add the key to your config file.

---

## Links

- **Toleno App:** [tolenocoin.com](https://tolenocoin.com)
- **npm Package:** [npmjs.com/package/@toleno/mcp](https://www.npmjs.com/package/@toleno/mcp)
- **GitHub:** [github.com/tolenonetwork/toleno-mcp](https://github.com/tolenonetwork/toleno-mcp)

---

MIT © [Toleno Network](https://tolenocoin.com)
