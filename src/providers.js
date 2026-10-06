// Model providers behind one interface: complete({system, user, schema, tier}) -> string.
// Keys live in Worker secrets; nothing here ever reaches the browser.

export const WORKERS_AI_MODELS = {
  big: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  small: "@cf/meta/llama-3.1-8b-instruct-fast",
};

const workersAI = {
  name: "workers-ai",
  available: (env) => !!env.AI,
  async complete(env, { system, user, schema, tier }) {
    const model = WORKERS_AI_MODELS[tier] || WORKERS_AI_MODELS.big;
    const req = {
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: 900,
      temperature: 0.1,
    };
    if (schema) req.response_format = { type: "json_schema", json_schema: schema };
    const r = await env.AI.run(model, req);
    const out = r?.response ?? r?.result?.response ?? r;
    return { text: typeof out === "string" ? out : JSON.stringify(out), model };
  },
};

// OpenAI-compatible endpoint; Featherless hosts open-weight models.
const featherless = {
  name: "featherless",
  available: (env) => !!env.FEATHERLESS_API_KEY,
  async complete(env, { system, user }) {
    const model = env.FEATHERLESS_MODEL || "meta-llama/Llama-3.3-70B-Instruct";
    const res = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.FEATHERLESS_API_KEY}` },
      body: JSON.stringify({ model, temperature: 0.1, max_tokens: 900, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    if (!res.ok) throw new Error(`featherless ${res.status}`);
    const j = await res.json();
    return { text: j.choices?.[0]?.message?.content ?? "", model };
  },
};

const anthropic = {
  name: "anthropic",
  available: (env) => !!env.ANTHROPIC_API_KEY,
  async complete(env, { system, user }) {
    const model = env.ANTHROPIC_MODEL || "claude-haiku-4-5";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 900, temperature: 0.1, system, messages: [{ role: "user", content: user }] }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const j = await res.json();
    return { text: j.content?.map((c) => c.text || "").join("") ?? "", model };
  },
};

export const PROVIDERS = { "workers-ai": workersAI, featherless, anthropic };

export function pickProvider(env) {
  const want = env.MODEL_PROVIDER || "workers-ai";
  const p = PROVIDERS[want];
  return p && p.available(env) ? p : null;
}
