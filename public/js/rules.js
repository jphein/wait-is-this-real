// Deterministic red-flag engine. Runs in the browser (instant, works offline)
// and in the Worker (ground truth handed to the model). No network, no model.
import { AGENCIES, isOfficialHost } from "./kb.js";

// weight: how strongly the flag alone suggests a scam (0..1).
// critical: a flag that, by itself, means "treat as a scam" (no real agency does this).
export const FLAGS = [
  {
    id: "gift_card_crypto",
    weight: 0.9, critical: true,
    re: [/\bgift ?cards?\b/i, /\b(google play|apple|itunes|target|walmart|steam) (card|gift)/i, /\bprepaid (debit )?cards?\b|\b(green ?dot|vanilla) (card|reload)\b|\btarjeta prepagada\b/i, /\b(bitcoin|crypto(currency)?|btc|usdt|bitcoin atm)\b/i, /tarjetas? de regalo/i, /\bcriptomoneda/i, /\bwestern union\b|\bmoneygram\b|wire (the )?(money|funds|payment)/i, /\bgiro (bancario|telegr[aá]fico)\b/i],
    title: { en: "Asks you to pay with gift cards, crypto or a wire", es: "Pide pagar con tarjetas de regalo, criptomonedas o giros" },
    why: { en: "No government agency or utility takes gift cards, crypto or wire transfers. Scammers want them because the money can't be traced or returned.", es: "Ninguna agencia del gobierno ni compañía de luz acepta tarjetas de regalo, criptomonedas o giros. Los estafadores los piden porque el dinero no se puede rastrear ni recuperar." },
  },
  {
    id: "p2p_payment",
    weight: 0.55,
    re: [/\b(zelle|venmo|cash ?app|paypal)\b/i, /\bcashtag\b|\$[a-z][a-z0-9]{2,}\b/i],
    title: { en: "Asks for payment through a money app", es: "Pide pago por una app de dinero" },
    why: { en: "Agencies don't collect fees or bills through Zelle, Venmo or Cash App. Money sent this way is almost never recovered.", es: "Las agencias no cobran por Zelle, Venmo o Cash App. El dinero enviado así casi nunca se recupera." },
  },
  {
    id: "threat_arrest",
    weight: 0.75, critical: true,
    re: [/\b(arrest(ed)?|warrant|police|sheriff|jail|deport(ation|ed)?|lawsuit|legal action)\b/i, /\b(arresto|arrestad[oa]|orden de (arresto|captura)|polic[ií]a|c[aá]rcel|deport(aci[oó]n|ad[oa])|demanda)\b/i, /\b(ice|inmigraci[oó]n)\b.*\b(agents?|agentes?)\b/i],
    title: { en: "Threatens arrest, police or deportation", es: "Amenaza con arresto, policía o deportación" },
    why: { en: "Real agencies don't threaten arrest to get paid. Fear is used to stop you from thinking or asking someone.", es: "Las agencias reales no amenazan con arresto para cobrar. El miedo se usa para que no piense ni le pregunte a nadie." },
  },
  {
    id: "urgency",
    weight: 0.35,
    re: [/\b(within|in) (\d{1,3}|an?|one) ?(hours?|hrs?|minutes?|mins?)\b/i, /\b(today|tonight|immediately|right away|final (notice|warning)|last chance|act now|urgent)\b/i, /\b(hoy mismo|de inmediato|inmediatamente|urgente|[uú]ltimo aviso|[uú]ltima oportunidad|en (24|48) horas)\b/i],
    title: { en: "Pushes you to act right now", es: "Le presiona a actuar ya" },
    why: { en: "A short deadline is a pressure tactic. Real benefit notices give you days or weeks and a way to ask questions.", es: "Un plazo muy corto es una táctica de presión. Los avisos reales le dan días o semanas y una forma de preguntar." },
  },
  {
    id: "benefit_suspended",
    weight: 0.5,
    re: [/\b(suspend(ed)?|deactivat(ed|e)|terminat(ed|e)|cancel(l)?ed|frozen|locked|blocked|on hold)\b.{0,40}\b(benefits?|ssn|social security|card|account|medi-?cal|calfresh|ebt|license|coverage)\b/i, /\b(benefits?|ssn|card|account|ebt)\b.{0,30}\b(suspend(ed)?|deactivated|locked|frozen|blocked)\b/i, /\b(suspendid[oa]s?|cancelad[oa]s?|bloquead[oa]s?|congelad[oa]s?|desactivad[oa]s?)\b/i],
    title: { en: "Says your benefits, card or number will be cut off", es: "Dice que le van a cortar beneficios, tarjeta o número" },
    why: { en: "Scammers say benefits are 'suspended' to scare you into clicking. Real changes come by mail with appeal rights.", es: "Dicen que sus beneficios están 'suspendidos' para asustarle. Los cambios reales llegan por correo con derecho a apelar." },
  },
  {
    id: "fee_for_benefit",
    weight: 0.7, critical: true,
    re: [/\b(processing|activation|release|renewal|enrollment|application|delivery|handling|clearance|unlock(ing)?) fee\b/i, /\bpay\b.{0,40}\b(to (receive|get|keep|release|claim|unlock)|before (you|we) (can )?(receive|release|send))\b/i, /\b(cuota|cargo|tarifa) (de|por) (procesamiento|activaci[oó]n|renovaci[oó]n|inscripci[oó]n|liberaci[oó]n|entrega)\b/i, /\bpag(ar|ue)\b.{0,40}\bpara (recibir|mantener|liberar|cobrar)\b/i],
    title: { en: "Wants a fee before you get a benefit or refund", es: "Pide un pago antes de darle un beneficio o reembolso" },
    why: { en: "Government benefits and refunds are free. 'Pay a small fee to release your money' is one of the oldest scams.", es: "Los beneficios y reembolsos del gobierno son gratis. 'Pague una cuota para liberar su dinero' es una de las estafas más viejas." },
  },
  {
    id: "asks_secret",
    weight: 0.7, critical: true,
    re: [/\b(pin|password|passcode|one[- ]time code|verification code|otp|security code)\b/i, /\b(full )?(ssn|social security number|bank (account|login)|routing number|card number|medicare number|mbi)\b.{0,30}\b(confirm|verify|provide|send|reply|enter|update)\b/i, /\b(confirm|verify|provide|send|reply with|enter|update)\b.{0,40}\b(ssn|social security number|bank (account|login)|routing number|card number|medicare number|date of birth)\b/i, /\b(contraseña|c[oó]digo (de verificaci[oó]n|de seguridad)|n[uú]mero de (tarjeta|cuenta|seguro social))\b/i, /\bpin\b/i],
    title: { en: "Asks for a PIN, code, password or your full SSN", es: "Pide un PIN, código, contraseña o su número de Seguro Social" },
    why: { en: "Your EBT PIN and one-time codes are like house keys. No agency, bank or utility will ever ask you to read them out or type them into a link.", es: "Su PIN de EBT y los códigos de un solo uso son como las llaves de su casa. Ninguna agencia, banco o compañía le pedirá decirlos ni escribirlos en un enlace." },
  },
  {
    id: "click_link_verify",
    weight: 0.4,
    re: [/\b(click|tap|visit|go to|open)\b.{0,30}\b(link|here|below|url)\b/i, /\b(verify|confirm|update|reactivate|restore|unlock|claim)\b.{0,30}\b(account|identity|information|info|benefits?|refund|card)\b/i, /\b(haga clic|toque|ingrese|entre)\b.{0,30}\b(enlace|aqu[ií]|link)\b/i, /\b(verifi(que|car)|confirm(e|ar)|actualic(e|ar)|reactiv(e|ar)|reclam(e|ar))\b.{0,30}\b(cuenta|identidad|informaci[oó]n|beneficios?|reembolso|tarjeta)\b/i],
    title: { en: "Wants you to tap a link to 'verify' or 'claim'", es: "Quiere que toque un enlace para 'verificar' o 'reclamar'" },
    why: { en: "Fake links lead to copycat sites that steal logins and card numbers. Go to the agency yourself instead of tapping.", es: "Los enlaces falsos llevan a sitios copiados que roban contraseñas y tarjetas. Vaya usted mismo al sitio de la agencia." },
  },
  {
    id: "too_good",
    weight: 0.35,
    re: [/\b(you('ve| have)? (won|been selected|qualif(y|ied))|congratulations|free (money|grant|government grant|iphone|tablet)|unclaimed (funds|money|refund)|bonus payment|extra (benefits|payment|calfresh|ebt))\b/i, /\b(ha ganado|fue seleccionad[oa]|felicidades|dinero gratis|subsidio gratis|fondos no reclamados|pago extra|beneficios extra)\b/i],
    title: { en: "Offers money or extra benefits out of nowhere", es: "Ofrece dinero o beneficios extra de la nada" },
    why: { en: "If you didn't apply, you didn't win. Agencies don't pick people at random for 'extra' payments.", es: "Si no aplicó, no ganó. Las agencias no escogen gente al azar para pagos 'extra'." },
  },
  {
    id: "secrecy",
    weight: 0.45,
    re: [/\b(don'?t|do not) (tell|share|discuss)\b|\bkeep (this|it) (confidential|secret|private)\b|\bstay on the (line|phone)\b/i, /\b(no (le )?(diga|cuente|comente)|mant[eé]ngalo en secreto|no cuelgue)\b/i],
    title: { en: "Tells you to keep it secret or stay on the line", es: "Le dice que lo mantenga en secreto o que no cuelgue" },
    why: { en: "Scammers isolate you so no one can warn you. A real agency is fine with you hanging up and calling back.", es: "Los estafadores le aíslan para que nadie le advierta. Una agencia real acepta que cuelgue y vuelva a llamar." },
  },
  {
    id: "remote_access",
    weight: 0.7, critical: true,
    re: [/\b(anydesk|teamviewer|quick ?support|remote access|screen ?share|install (this|the) app)\b/i, /\b(acceso remoto|compartir pantalla|instale (esta|la) app)\b/i],
    title: { en: "Wants remote access to your phone or computer", es: "Quiere acceso remoto a su teléfono o computadora" },
    why: { en: "With remote access a scammer can see your bank and move money. Agencies never need it.", es: "Con acceso remoto el estafador puede ver su banco y mover dinero. Las agencias nunca lo necesitan." },
  },
  {
    id: "dead_program",
    weight: 0.6,
    re: [/\b(acp|affordable connectivity)\b/i, /\b(stimulus|est[ií]mulo) (check|payment|cheque|pago)\b/i],
    title: { en: "Mentions a program that has ended", es: "Menciona un programa que ya terminó" },
    why: { en: "The Affordable Connectivity Program (ACP) and the COVID stimulus checks have ended. Offers to sign you up are a common bait.", es: "El programa ACP y los cheques de estímulo del COVID ya terminaron. Ofrecer inscribirle es un anzuelo común." },
  },
];

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,24}(?:\/[^\s<>"')]*)?)/gi;
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "rb.gy", "cutt.ly", "ow.ly", "shorturl.at", "tiny.cc", "s.id", "goo.su"];
const SUSPICIOUS_TLDS = ["top", "xyz", "icu", "click", "info", "live", "online", "site", "shop", "support", "vip", "cc", "buzz", "cfd", "sbs", "lat", "help"];
const AGENCY_TOKENS = ["ssa", "irs", "medicare", "medi-cal", "medical", "dmv", "ebt", "calfresh", "pge", "edd", "fastrak", "toll", "covered", "lifeline", "usps", "benefit", "gov", "refund", "treasury"];

// Ignore phone-like and money-like tokens ("1.800", "$12.50") that look like hosts.
function extractHosts(text) {
  const out = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[1];
    if (/^\d+(\.\d+)+$/.test(raw)) continue;
    const host = raw.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase().replace(/\.$/, "");
    if (!/[a-z]/.test(host.split(".").pop())) continue;
    out.push({ raw, host });
  }
  return out;
}

// Real notices warn people ("we will NEVER ask for your PIN"). A pattern inside
// a warning sentence is protective advice, not a red flag.
const WARNING_RE = /\b(never|will not|won'?t ever|do not share|don'?t share|don'?t give|nunca|jam[aá]s|no comparta|no d[eé])\b/i;

export function splitSentences(text) {
  return text.split(/(?<=[.!?¡¿\n])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
}

function firstAffirmativeMatch(patterns, sentences) {
  for (const s of sentences) {
    if (WARNING_RE.test(s)) continue;
    for (const r of patterns) {
      const m = s.match(r);
      if (m) return m;
    }
  }
  return null;
}

export function analyzeLinks(text) {
  const findings = [];
  for (const { raw, host } of extractHosts(text)) {
    const tld = host.split(".").pop();
    const official = isOfficialHost(host);
    const shortener = SHORTENERS.includes(host);
    const label = host.split(".").slice(0, -1).join(".");
    const mimics = !official && AGENCY_TOKENS.some((t) => label.includes(t));
    findings.push({ raw, host, official, shortener, mimics, suspiciousTld: SUSPICIOUS_TLDS.includes(tld) });
  }
  return findings;
}

export function detectAgencies(text) {
  const t = text.toLowerCase();
  const hits = [];
  for (const [id, a] of Object.entries(AGENCIES)) {
    const n = a.keywords.filter((k) => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")}([^a-z]|$)`, "i").test(t)).length;
    if (n) hits.push({ id, n });
  }
  // "medical" alone is ambiguous in English; only count it if nothing better matched.
  return hits.sort((a, b) => b.n - a.n).map((h) => h.id).filter((id, _, arr) => !(id === "medical" && arr.length > 1 && !/medi-?cal/i.test(t)));
}

export function analyze(text) {
  const input = String(text || "").slice(0, 8000);
  const flags = [];
  const sentences = splitSentences(input);
  for (const f of FLAGS) {
    const m = firstAffirmativeMatch(f.re, sentences);
    if (m) flags.push({ id: f.id, weight: f.weight, critical: !!f.critical, title: f.title, why: f.why, evidence: m[0].slice(0, 80) });
  }
  const links = analyzeLinks(input);
  const badLinks = links.filter((l) => !l.official && (l.shortener || l.mimics || l.suspiciousTld));
  if (badLinks.length) {
    const l = badLinks[0];
    flags.push({
      id: "lookalike_link", weight: l.mimics ? 0.8 : 0.6, critical: !!l.mimics,
      title: { en: "The link is not an official website", es: "El enlace no es un sitio oficial" },
      why: {
        en: l.mimics ? `"${l.host}" borrows an agency's name but is not a .gov or official site. Copycat addresses like this are made to steal information.` : `"${l.host}" hides or disguises where it really goes. Official agencies link to their own .gov (or official) website.`,
        es: l.mimics ? `"${l.host}" usa el nombre de una agencia pero no es un sitio .gov ni oficial. Direcciones copiadas así se hacen para robar información.` : `"${l.host}" esconde a dónde lleva realmente. Las agencias oficiales enlazan a su propio sitio .gov u oficial.`,
      },
      evidence: l.raw.slice(0, 80),
    });
  }
  // Score: probabilistic OR of flag weights; any critical flag floors it at 85.
  let p = 1;
  for (const f of flags) p *= 1 - f.weight;
  let score = Math.round((1 - p) * 100);
  if (flags.some((f) => f.critical)) score = Math.max(score, 85);
  return { score, flags, links, agencies: detectAgencies(input), officialLinksOnly: links.length > 0 && links.every((l) => l.official) };
}

export function band(score) {
  if (score >= 70) return "scam";
  if (score >= 35) return "suspicious";
  return "low";
}
