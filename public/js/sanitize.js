// Contact scrubber. Model text is shown to people who are deciding whether to
// call a number. So any phone number or web address in model output that is
// not in the knowledge base is replaced, and the replacement says why.
import { allowedPhones, digits, isOfficialHost } from "./kb.js";

const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b|\b1-8\d{2}-[A-Z]{3,4}-?[A-Z0-9]{0,4}\b/g;
const URL_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,24}(?:\/[^\s<>"')\]]*)?/gi;

export function scrubContacts(text, lang = "en") {
  const phones = allowedPhones();
  const removed = [];
  const tag = lang === "es" ? "[número quitado: use el número oficial de abajo]" : "[number removed: use the official number below]";
  const ltag = lang === "es" ? "[enlace quitado]" : "[link removed]";
  let out = String(text ?? "").replace(PHONE_RE, (m) => {
    if (phones.has(digits(m))) return m;
    removed.push(m);
    return tag;
  });
  out = out.replace(URL_RE, (m) => {
    if (/^\d+(\.\d+)+$/.test(m)) return m; // dollar amounts, versions
    const host = m.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
    if (!/[a-z]{2,}$/.test(host)) return m;
    if (isOfficialHost(host)) return m;
    removed.push(m);
    return ltag;
  });
  return { text: out, removed };
}

// Deep-scrub every string in a model's JSON answer.
export function scrubDeep(value, lang, removed = []) {
  if (typeof value === "string") {
    const r = scrubContacts(value, lang);
    removed.push(...r.removed);
    return r.text;
  }
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, lang, removed));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubDeep(v, lang, removed)]));
  }
  return value;
}
