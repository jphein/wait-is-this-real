// Scores the rule engine (and optionally the live API) on test/vectors.json.
//   node scripts/eval.mjs              rules only
//   node scripts/eval.mjs --api URL    full pipeline via a deployed /api/check
//   --file test/heldout.json           score another vector set
import { readFileSync } from "node:fs";
import { analyze, band } from "../public/js/rules.js";

const fileIdx = process.argv.indexOf("--file");
const file = fileIdx > 0 ? process.argv[fileIdx + 1] : new URL("../test/vectors.json", import.meta.url);
const vectors = JSON.parse(readFileSync(file));
const apiIdx = process.argv.indexOf("--api");
const api = apiIdx > 0 ? process.argv[apiIdx + 1] : null;

async function predict(v) {
  if (!api) { const r = analyze(v.text); return { score: r.score, agencies: r.agencies, src: "rules" }; }
  const res = await fetch(new URL("/api/check", api), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: v.text, lang: v.lang }) });
  const j = await res.json();
  return { score: j.score, agencies: j.agencies.map((a) => a.id), src: j.engine };
}

let tp = 0, fp = 0, tn = 0, fn = 0, agencyHit = 0, agencyN = 0;
const rows = [];
for (const v of vectors) {
  const p = await predict(v);
  const predScam = band(p.score) !== "low";
  const isScam = v.label === "scam";
  if (predScam && isScam) tp++; else if (predScam) fp++; else if (isScam) fn++; else tn++;
  const want = [v.agency].flat().filter(Boolean);
  if (want.length) { agencyN++; if (want.includes(p.agencies[0])) agencyHit++; }
  const ok = predScam === isScam;
  rows.push(`${ok ? "✓" : "✗"} ${String(p.score).padStart(3)} ${band(p.score).padEnd(10)} ${v.id.padEnd(22)} agency=${p.agencies[0] ?? "-"}${want.length && !want.includes(p.agencies[0]) ? ` (want ${want.join("|")})` : ""} [${p.src}]`);
}
console.log(rows.join("\n"));
const prec = tp / (tp + fp || 1), rec = tp / (tp + fn || 1);
console.log(`\n${vectors.length} vectors  precision ${(prec * 100).toFixed(1)}%  recall ${(rec * 100).toFixed(1)}%  ` +
  `false alarms on legit ${fp}/${fp + tn}  agency top-1 ${agencyHit}/${agencyN}`);
