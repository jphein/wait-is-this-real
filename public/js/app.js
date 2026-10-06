import { analyze, band } from "./rules.js";
import { AGENCIES, GENERAL_REPORT } from "./kb.js";

const T = {
  en: {
    skip: "Skip to the message box", title: "Wait, Is This Real?", tagline: "A free scam check for messages about benefits and bills.",
    askH: "Got a text, email, call or letter that worries you?",
    askP: "Paste it below. We'll look for the tricks scammers use and show you the real agency's number so you can check for yourself.",
    label: "Message to check", placeholder: "Paste the message here…", check: "Check it", checking: "Checking…", clear: "Clear",
    try: "Try an example:", exEbt: "EBT \"card locked\" text", exPge: "PG&E shut-off call", exMedical: "Medi-Cal renewal letter",
    privacy: "We don't save what you paste. Remove names, account numbers and your address before checking if you can.",
    foot: "Made for families who get these messages every week. Not legal advice. If you already sent money or a code, call your bank and report it right away.",
    v_scam: "This looks like a scam", v_suspicious: "Be careful: this could be a scam", v_low: "We didn't find scam signs",
    s_scam: "Don't reply, don't tap links, and don't pay. Check with the agency yourself using the number below.",
    s_suspicious: "Some things here are worrying. Don't use any number or link in the message. Check with the agency yourself.",
    s_low: "That's a good sign, but scams change fast. If anything asks for money, a PIN or a code, check with the agency yourself.",
    flagsH: "Red flags we found", checkH: "Check it yourself", noFlags: "No red flags found.", stepsH: "What to do now",
    realH: (n) => `What the real ${n} does`, does: "They do", never: "They never",
    callVerify: "Call", visit: "Official site", reportH: "Report it", reportAgency: "Report to",
    aiPending: "Asking the AI for a closer look…", aiLabel: "AI", rulesOnly: "Quick check only (the AI check is unavailable right now).",
    engine: (r) => `Checked by: ${r.engine === "rules" ? "red-flag rules" : `red-flag rules + AI (${r.model})`}. Contacts come only from our checked list${r.scrubbed ? `; we removed ${r.scrubbed} unverified number(s) or link(s) from the AI's answer` : ""}.`,
    meterL: ["Looks OK", "Careful", "Scam"], err: "Something went wrong. The quick check below still works.",
    noAgency: "We couldn't tell which agency this claims to be. Look up the agency's number yourself (on your card, a bill, or its .gov website); never use the number in the message.",
  },
  es: {
    skip: "Ir al cuadro del mensaje", title: "Espere, ¿esto es real?", tagline: "Revisión gratis de estafas en mensajes sobre beneficios y facturas.",
    askH: "¿Le llegó un texto, correo, llamada o carta que le preocupa?",
    askP: "Péguelo abajo. Buscamos los trucos que usan los estafadores y le damos el número real de la agencia para que usted mismo confirme.",
    label: "Mensaje para revisar", placeholder: "Pegue el mensaje aquí…", check: "Revisar", checking: "Revisando…", clear: "Borrar",
    try: "Pruebe un ejemplo:", exEbt: "Texto de \"tarjeta EBT bloqueada\"", exPge: "Llamada de corte de PG&E", exMedical: "Carta de renovación de Medi-Cal",
    privacy: "No guardamos lo que pega. Si puede, quite nombres, números de cuenta y su dirección antes de revisar.",
    foot: "Hecho para familias que reciben estos mensajes cada semana. No es asesoría legal. Si ya mandó dinero o un código, llame a su banco y repórtelo de inmediato.",
    v_scam: "Esto parece una estafa", v_suspicious: "Cuidado: esto podría ser una estafa", v_low: "No encontramos señales de estafa",
    s_scam: "No conteste, no toque enlaces y no pague. Confirme con la agencia usted mismo usando el número de abajo.",
    s_suspicious: "Hay cosas preocupantes. No use ningún número ni enlace del mensaje. Confirme con la agencia usted mismo.",
    s_low: "Es buena señal, pero las estafas cambian rápido. Si algo le pide dinero, un PIN o un código, confirme con la agencia.",
    flagsH: "Señales de alerta", checkH: "Confírmelo usted mismo", noFlags: "No encontramos señales de alerta.", stepsH: "Qué hacer ahora",
    realH: (n) => `Lo que hace la verdadera agencia: ${n}`, does: "Sí hacen", never: "Nunca hacen",
    callVerify: "Llamar al", visit: "Sitio oficial", reportH: "Repórtelo", reportAgency: "Reportar a",
    aiPending: "Pidiendo a la IA una revisión más a fondo…", aiLabel: "IA", rulesOnly: "Solo revisión rápida (la IA no está disponible ahora).",
    engine: (r) => `Revisado por: ${r.engine === "rules" ? "reglas de alerta" : `reglas de alerta + IA (${r.model})`}. Los contactos vienen solo de nuestra lista verificada${r.scrubbed ? `; quitamos ${r.scrubbed} número(s) o enlace(s) sin verificar de la respuesta de la IA` : ""}.`,
    meterL: ["Parece bien", "Cuidado", "Estafa"], err: "Algo falló. La revisión rápida de abajo sigue funcionando.",
    noAgency: "No pudimos saber qué agencia dice ser. Busque usted mismo el número de la agencia (en su tarjeta, una factura o su sitio .gov); nunca use el número del mensaje.",
  },
};

// Fictional examples (202-555-01xx numbers, example.org hosts).
const EXAMPLES = {
  ebt: {
    en: "EBT ALERT: Your EBT card has been locked due to suspicious activity. To unlock it, visit ebt-unlock.example.org and confirm your card number and PIN within 24 hours.",
    es: "ALERTA EBT: Su tarjeta EBT fue bloqueada por actividad sospechosa. Para desbloquearla entre a ebt-desbloqueo.example.org y confirme su número de tarjeta y su PIN en 24 horas.",
  },
  pge: {
    en: "Voicemail: \"Hi, this is the PG&E disconnection department. Your power will be shut off in 45 minutes for an unpaid balance of $412. To stop it, pay with a prepaid card and call us back at 202-555-0163 with the card number. Don't hang up on our agent.\"",
    es: "Mensaje de voz: \"Hola, le llama el departamento de desconexión de PG&E. Su luz será cortada en 45 minutos por un saldo de $412. Para evitarlo, pague con una tarjeta prepagada y llámenos al 202-555-0163 con el número de la tarjeta. No cuelgue.\"",
  },
  medical: {
    en: "Your Medi-Cal renewal packet was mailed to you. Please return it by the date on the form, or renew online at benefitscal.com. If you have questions, call your county office.",
    es: "Le enviamos por correo su paquete de renovación de Medi-Cal. Devuélvalo antes de la fecha indicada o renueve en línea en benefitscal.com. Si tiene preguntas, llame a su oficina del condado.",
  },
};

const urlLang = new URLSearchParams(location.search).get("lang");
let saved = null;
try { saved = localStorage.getItem("witr-lang"); } catch {}
let lang = [urlLang, saved].find((l) => l === "en" || l === "es") || ((navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en");
let lastText = "", lastResult = null, seq = 0;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const tel = (p) => `tel:${String(p).replace(/[^\d+]/g, "")}`;

function applyLang() {
  document.documentElement.lang = lang;
  document.title = T[lang].title;
  document.querySelectorAll("[data-i18n]").forEach((el) => { const v = T[lang][el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = T[lang][el.dataset.i18nPh]; });
  document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  if (lastResult) render(lastResult, false);
}

// Turn the browser-side rule result into the same shape the API returns.
function localResult(text) {
  const r = analyze(text);
  const pick = (o) => o?.[lang] ?? o?.en;
  return {
    score: r.score, verdict: band(r.score), engine: "rules", local: true,
    flags: r.flags.map((f) => ({ id: f.id, source: "rules", title: pick(f.title), why: pick(f.why), evidence: f.evidence })),
    agencies: r.agencies.slice(0, 2).map((id) => { const a = AGENCIES[id]; return { id, name: pick(a.name), verify: a.verify, report: { ...a.report, label: pick(a.report.label) }, does: pick(a.does), never: pick(a.never) }; }),
    report: GENERAL_REPORT.map((g) => ({ ...g, label: pick(g.label) })),
    nextSteps: null, summary: null,
  };
}

function render(r, pending) {
  const t = T[lang];
  const v = r.verdict;
  const flags = r.flags.length
    ? `<ul class="flags">${r.flags.map((f) => `<li class="${f.source === "ai" ? "ai" : ""}">${f.source === "ai" ? `<span class="src">${t.aiLabel}</span>` : ""}<b>${esc(f.title)}</b>${esc(f.why)}${f.evidence ? `<span class="ev">“${esc(f.evidence)}”</span>` : ""}</li>`).join("")}</ul>`
    : `<p>${t.noFlags}</p>`;
  const agencies = r.agencies.length ? r.agencies.map((a) => `
    <div class="agency">
      <h4>${esc(t.realH(a.name))}</h4>
      <div class="cols">
        <div><b>${t.does}</b><ul class="yes">${a.does.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><b>${t.never}</b><ul class="no">${a.never.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>
      <div class="call">
        ${a.verify.phone ? `<a href="${tel(a.verify.phone)}">📞 ${t.callVerify} ${esc(a.verify.phone)}</a>` : ""}
        <a class="alt" href="${esc(a.verify.url)}" rel="noopener" target="_blank">${t.visit}: ${esc(new URL(a.verify.url).hostname.replace(/^www\./, ""))}</a>
      </div>
    </div>`).join("") : `<p>${t.noAgency}</p>`;
  const reports = [
    ...r.agencies.map((a) => a.report).filter((x) => x?.url || x?.phone),
    ...r.report,
  ].map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.label)}</a>` : esc(x.label)}${x.phone && x.phone !== "7726" ? ` · <a href="${tel(x.phone)}">${esc(x.phone)}</a>` : ""}</li>`).join("");
  const steps = r.nextSteps?.length ? `<h3>${t.stepsH}</h3><ol class="steps">${r.nextSteps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : "";

  const el = $("#result");
  el.hidden = false;
  el.innerHTML = `
    <div class="verdict ${v}">
      <h2>${t["v_" + v]}</h2>
      <div class="meter" role="img" aria-label="${r.score}/100"><i style="left:${Math.max(3, Math.min(97, r.score))}%"></i></div>
      <div class="meter-l"><span>${t.meterL[0]}</span><span>${t.meterL[1]}</span><span>${t.meterL[2]}</span></div>
      <p class="sub">${esc(r.summary || t["s_" + v])}</p>
    </div>
    ${pending ? `<p class="pending">${t.aiPending}</p>` : ""}
    <h3>${t.flagsH}</h3>${flags}
    ${steps}
    <h3>${t.checkH}</h3>${agencies}
    <h3>${t.reportH}</h3><ul class="report">${reports}</ul>
    <p class="engine">${r.local && !pending ? t.rulesOnly : r.local ? "" : esc(t.engine(r))}</p>`;
}

async function run() {
  const text = $("#msg").value.trim();
  if (!text) { $("#msg").focus(); return; }
  const my = ++seq;
  lastText = text;
  lastResult = localResult(text);
  render(lastResult, true);
  const btn = $("#go");
  btn.disabled = true; btn.textContent = T[lang].checking;
  try {
    const res = await fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, lang }) });
    if (!res.ok) throw new Error(String(res.status));
    const r = await res.json();
    if (my !== seq) return;
    lastResult = r;
    render(r, false);
  } catch {
    if (my !== seq) return;
    render(lastResult, false);
  } finally {
    if (my === seq) { btn.disabled = false; btn.textContent = T[lang].check; }
  }
  $("#result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => {
  lang = b.dataset.lang;
  try { localStorage.setItem("witr-lang", lang); } catch {}
  applyLang();
  // The AI answer is written in one language; re-ask in the new one.
  if (lastText && !lastResult?.local) run();
}));
$("#go").addEventListener("click", run);
$("#msg").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(); });
$("#clear").addEventListener("click", () => { $("#msg").value = ""; $("#result").hidden = true; lastResult = null; lastText = ""; $("#msg").focus(); });
document.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { $("#msg").value = EXAMPLES[b.dataset.ex][lang]; run(); }));
fetch("/api/version").then((r) => r.ok ? r.json() : null).then((v) => { if (v) $("#ver").textContent = `${v.version} · ${v.hash}`; }).catch(() => {});
applyLang();
