// Cloudflare Worker: static site + /api/check. Messages are never stored or logged.
import { check } from "./pipeline.js";
import { pickProvider } from "./providers.js";

const MAX_CHARS = 8000;
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

// Daily model budget keeps a public demo inside the free Workers AI allocation.
// Big model first, then the small one, then rules only. Counters are approximate
// (KV is eventually consistent), which is fine for a soft cap.
async function budgetTier(env) {
  if (!env.BUDGET) return "big";
  const day = new Date().toISOString().slice(0, 10);
  const big = Number(env.DAILY_BIG ?? 60), small = Number(env.DAILY_SMALL ?? 120);
  const used = Number((await env.BUDGET.get(`n:${day}`)) ?? 0);
  if (used >= big + small) return null;
  await env.BUDGET.put(`n:${day}`, String(used + 1), { expirationTtl: 172800 });
  return used < big ? "big" : "small";
}

async function rateLimited(env, ip) {
  if (!env.BUDGET || !ip) return false;
  const hour = new Date().toISOString().slice(0, 13);
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${hour}|${ip}`));
  const key = `ip:${[...new Uint8Array(h)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  const n = Number((await env.BUDGET.get(key)) ?? 0);
  if (n >= Number(env.HOURLY_PER_IP ?? 30)) return true;
  await env.BUDGET.put(key, String(n + 1), { expirationTtl: 7200 });
  return false;
}

async function handleCheck(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Send JSON: {\"text\": \"...\", \"lang\": \"en\"|\"es\"}" }, 400); }
  const text = String(body?.text ?? "").trim();
  const lang = body?.lang === "es" ? "es" : "en";
  if (!text) return json({ error: lang === "es" ? "Pegue un mensaje para revisar." : "Paste a message to check." }, 400);
  if (text.length > MAX_CHARS) return json({ error: `Max ${MAX_CHARS} characters.` }, 413);

  const ip = request.headers.get("cf-connecting-ip");
  let provider = pickProvider(env), tier = "big", limited = false;
  if (provider && (await rateLimited(env, ip))) { provider = null; limited = true; }
  if (provider) { tier = await budgetTier(env); if (!tier) provider = null; }
  const result = await check({ text, lang, provider, env, tier: tier ?? "big" });
  if (limited) result.note = "rate-limited: rules only";
  else if (!provider) result.note = "model budget used up for today: rules only";
  return json(result);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/check") {
      if (request.method !== "POST") return json({ error: "POST only" }, 405, { allow: "POST" });
      return handleCheck(request, env);
    }
    if (url.pathname === "/api/healthz") {
      const p = pickProvider(env);
      return json({ ok: true, provider: p?.name ?? "rules-only", platform: "cloudflare-workers" });
    }
    if (url.pathname === "/api/version") {
      return env.ASSETS.fetch(new Request(new URL("/version.json", url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
