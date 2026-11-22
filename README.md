# jarvis-tools

MCP server — three focused tools for AI agents:

| Tool | What it does |
|---|---|
| `render_page` | Renders JS-heavy pages with real headless Chrome on a **residential IP** — passes anti-bot walls that block datacenter scrapers. Returns title, meta, headings, main text, links. |
| `token_verdict` | Deterministic EVM token security verdict (SAFE/CAUTION/DANGER + score 0-100) from GoPlus + DexScreener: honeypot, mintable, hidden owner, taxes, liquidity, holders. **Batch up to 50 addresses.** |
| `research` | Multi-source research: GitHub, Hacker News, Wikipedia, arXiv — merged and deduplicated. |

## Pricing

- **Free tier**: **50 calls/day** (10/day for `render_page`) — no wallet, no signup. API key auto-provisions on first run.
- **Pro Pack (€9 one-time — 5,000 calls, valid 1 year)**: pay by **Card / Apple Pay / Google Pay** on Polar → receive an instant `JTPRO-...` license key → **[Buy Pro Pack (€9)](https://buy.polar.sh/polar_cl_Vtefi8kWLrjMjtuxQRS257OIy7AoGmcW5MYYD2ibGYk)**.
- **Pay-per-call crypto**: x402 USDC micropayments on Base (`/services`).

## Install

### Claude Desktop / Cursor / Cline (stdio)

```json
{
  "mcpServers": {
    "jarvis-tools": {
      "command": "npx",
      "args": ["-y", "jarvis-tools"],
      "env": {
        "JARVIS_TOOLS_API_KEY": "optional-JTPRO-key-for-5000-calls"
      }
    }
  }
}
```

### Remote (streamable HTTP — any MCP client)

```
https://jarvis-proxy.jarvis-studio.workers.dev/mcp
```

Pass `X-API-Key: jt_...` (free from `GET /mcp/key`) or `X-API-Key: JTPRO-...` (Pro Pack).

## Notes

- `render_page` runs on a residential IP — that's the point (anti-bot), capped at 10/day free and 100/day Pro.
- `token_verdict` supports Base, Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche.
- Public accuracy record for verdicts: `GET /token-verdict/accuracy`.

MIT © Jarvis Studio
