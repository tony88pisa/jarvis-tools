# jarvis-tools

MCP server — three focused tools for agents:

| Tool | What it does |
|---|---|
| `render_page` | Renders JS-heavy pages with real headless Chrome on a **residential IP** — passes anti-bot walls that block datacenter scrapers. Returns title, meta, headings, main text, links. |
| `token_verdict` | Deterministic EVM token security verdict (SAFE/CAUTION/DANGER + score 0-100) from GoPlus + DexScreener: honeypot, mintable, hidden owner, taxes, liquidity, holders. **Batch up to 50 addresses.** |
| `research` | Multi-source research: GitHub, Hacker News, Wikipedia, arXiv — merged and deduplicated. |

**Free tier: 50 calls/day** (10/day for `render_page`) — no wallet, no signup. API key auto-provisions on first run. Beyond the free tier: x402 USDC micropayments on Base.

## Install

### Claude Desktop / Cursor / Cline (stdio)

```json
{
  "mcpServers": {
    "jarvis-tools": {
      "command": "npx",
      "args": ["-y", "jarvis-tools"]
    }
  }
}
```

### Remote (streamable HTTP — any MCP client)

```
https://jarvis-proxy.jarvis-studio.workers.dev/mcp
```

Optional header `X-API-Key: jt_...` — get one free at `GET /mcp/key`.

## Notes

- `render_page` runs on a residential IP — that's the point (anti-bot), and the limit (10/day free; treat it as a high-margin niche, not a volume tool).
- `token_verdict` supports Base, Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche.
- Public accuracy record for verdicts: `GET /token-verdict/accuracy`.

MIT © Jarvis Studio
