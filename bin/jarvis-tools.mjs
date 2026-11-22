#!/usr/bin/env node
// jarvis-tools — MCP stdio server che fa da proxy all'endpoint remoto.
// Lo sviluppatore lo cabla una volta in Claude Desktop / Cursor / Cline;
// il suo agente poi chiama i tool per mesi. Quota free gestita lato server.
//
// Protocollo: JSON-RPC 2.0 newline-delimited su stdio (MCP stdio transport).
// Ogni messaggio in arrivo viene girato a POST {REMOTE}/mcp con la API key
// (env JARVIS_TOOLS_API_KEY > file ~/.jarvis-tools-key > auto-provisioning).

import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REMOTE = process.env.JARVIS_TOOLS_REMOTE ?? 'https://jarvis-proxy.jarvis-studio.workers.dev';
const KEY_FILE = join(homedir(), '.jarvis-tools-key');
const log = (...a) => console.error('[jarvis-tools]', ...a);

let apiKey = process.env.JARVIS_TOOLS_API_KEY?.trim() ?? '';
if (!apiKey) {
  try { apiKey = readFileSync(KEY_FILE, 'utf8').trim(); } catch { /* primo avvio */ }
}

async function ensureKey() {
  if (apiKey) return apiKey;
  try {
    const r = await fetch(`${REMOTE}/mcp/key`, { signal: AbortSignal.timeout(15_000) });
    const j = await r.json();
    if (j?.key) {
      apiKey = j.key;
      try { writeFileSync(KEY_FILE, apiKey, { mode: 0o600 }); } catch { /* ok */ }
      log(`API key auto-generata e salvata in ${KEY_FILE}`);
    }
  } catch (e) {
    log(`provisioning key fallito (${e.message}) — quota per-IP in fallback`);
  }
  return apiKey;
}

const write = (msg) => {
  if (msg === null || msg === undefined) return;
  process.stdout.write(JSON.stringify(msg) + '\n');
};

const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function forward(msg) {
  const isCall = !Array.isArray(msg) && msg?.method === 'tools/call';
  const batchCall = Array.isArray(msg) && msg.some((m) => m?.method === 'tools/call');
  const timeout = isCall || batchCall ? 90_000 : 20_000;
  try {
    const r = await fetch(`${REMOTE}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify(msg),
      signal: AbortSignal.timeout(timeout),
    });
    if (r.status === 202) return null;
    if (!r.ok) {
      const id = Array.isArray(msg) ? null : msg?.id;
      return rpcError(id, -32000, `remote HTTP ${r.status}`);
    }
    return await r.json();
  } catch (e) {
    const id = Array.isArray(msg) ? null : msg?.id;
    return rpcError(id, -32000, `remote non raggiungibile: ${e.message}`);
  }
}

async function main() {
  await ensureKey();
  const rl = createInterface({ input: process.stdin, terminal: false });
  const queue = [];
  let working = false;
  let closed = false;
  const maybeExit = () => { if (closed && !working && queue.length === 0) process.exit(0); };

  const drain = async () => {
    if (working) return;
    working = true;
    while (queue.length) {
      const line = queue.shift();
      let msg;
      try { msg = JSON.parse(line); } catch { write(rpcError(null, -32700, 'parse error')); continue; }
      const res = await forward(msg);
      if (res !== null) write(res);
    }
    working = false;
    maybeExit();
  };

  rl.on('line', (line) => {
    const t = line.trim();
    if (!t) return;
    queue.push(t);
    void drain();
  });
  rl.on('close', () => { closed = true; maybeExit(); });
  log(`attivo — remoto ${REMOTE} (key ${apiKey ? apiKey.slice(0, 10) + '…' : 'per-IP'})`);
}

main().catch((e) => { log(e); process.exit(1); });
