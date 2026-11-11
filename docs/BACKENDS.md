# Backends: Wait, Is This Real?

Standing rule (JP 2026-10-27, "Backends grow continually"): every project that talks to outside sources keeps this file as a tiered backlog: per row the backend, the account or key it needs, its terms caveat and its status. Started 2026-11-11 (money-e9). Keys live in the Cloudflare Worker's secrets and the vault, never here.

Status words: **live** (in code and serving) · **candidate** (not started) · **credit** (a sponsor credit on an account, with its state).

## Tier A: LLM providers behind `POST /api/check` (the browser never sees a key)

| Backend | What it does here | Key / account | Terms caveat | Status |
|---|---|---|---|---|
| Cloudflare Workers AI (Llama 3.3 70B) | Default classifier + plain-language explanation | the Worker's own binding (Cloudflare account, no API key) | Workers AI neurons billing on the paid Workers plan; no user text retained by us | live |
| Featherless AI (OpenAI-compatible, open models) | Alternative provider, selected by config | Featherless account (JP's, created 2026-10-10 for ForgeHacks) + API key as a Worker secret | ForgeHacks sponsor credit: "request credits" via the FORGE26 join link (vault note "ForgeHacks 2026 sponsor codes (participant packet)"); JP's claim card perks:featherless-forge26 (Thu 2026-11-12); credit amount per the earlier packet read $25, expiry not stated; pay-as-you-go after | credit: staged for JP's click 2026-11-11 |
| Anthropic (Claude) | Alternative provider, selected by config | Anthropic API key as a Worker secret (TechEMPOWER's nonprofit-tier account) | per-token billing; the 75% nonprofit discount already applies | live (config) |

## Tier C: candidates

| Backend | What it would do here | Key / account | Terms caveat | Status |
|---|---|---|---|---|
| A local model on familiar (Ollama / the Qwen lane) | Zero-cost classifier for LAN deployments | none | latency from the LAN only; not for the public Worker | candidate |
