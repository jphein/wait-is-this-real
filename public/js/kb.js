// Agency knowledge base: the ONLY source of phone numbers and web addresses
// this app will ever show a user. The language model may name an agency, but
// every "verify at" and "report to" contact comes from this file. A model that
// invents a "call this number to verify" would itself become a scam vector.
//
// Each contact was checked against the agency's own website on 2026-10-06;
// sources are in docs/kb-sources.md (see README, "Keeping the contacts honest"). `domains` lists the official hostnames;
// any subdomain of these is treated as official.

export const KB_VERSION = "2026-10-06";

export const AGENCIES = {
  ssa: {
    name: { en: "Social Security Administration (SSA)", es: "Administración del Seguro Social (SSA)" },
    domains: ["ssa.gov"],
    keywords: ["social security", "seguro social", "ssa", "ssi", "ssdi", "ssn", "número de seguro social", "numero de seguro social"],
    verify: { phone: "1-800-772-1213", url: "https://www.ssa.gov" },
    report: { label: { en: "SSA Office of the Inspector General", es: "Oficina del Inspector General del SSA" }, url: "https://oig.ssa.gov", phone: "1-800-269-0271" },
    does: {
      en: ["Mostly contacts you by U.S. mail", "May call you if you already have business with them", "Lets you check your record yourself at ssa.gov"],
      es: ["Casi siempre le contacta por correo postal", "Puede llamarle si ya tiene un trámite con ellos", "Le deja revisar su cuenta usted mismo en ssa.gov"],
    },
    never: {
      en: ["Suspend your Social Security number", "Threaten arrest or legal action to make you pay", "Ask for gift cards, crypto, wire transfers or cash by mail", "Text or email you a link to 'reactivate' benefits"],
      es: ["Suspender su número de Seguro Social", "Amenazar con arresto o acción legal para que pague", "Pedir tarjetas de regalo, criptomonedas, giros o efectivo por correo", "Enviarle un enlace por texto o correo para 'reactivar' beneficios"],
    },
  },
  irs: {
    name: { en: "Internal Revenue Service (IRS)", es: "Servicio de Impuestos Internos (IRS)" },
    domains: ["irs.gov", "treasury.gov", "tigta.gov"],
    keywords: ["irs", "tax refund", "reembolso de impuestos", "impuestos", "back taxes", "tax return", "stimulus", "estímulo", "estimulo"],
    verify: { phone: "1-800-829-1040", url: "https://www.irs.gov" },
    report: { label: { en: "Treasury Inspector General (TIGTA) — IRS impersonation", es: "Inspector General del Tesoro (TIGTA) — suplantación del IRS" }, url: "https://www.tigta.gov", phone: "1-800-366-4484" },
    does: {
      en: ["Starts contact about a tax bill by U.S. mail", "Lets you see any balance you owe at irs.gov/account", "Takes payment only to the 'United States Treasury'"],
      es: ["Inicia el contacto sobre una deuda por correo postal", "Le deja ver cualquier saldo en irs.gov/account", "Solo acepta pagos a nombre del 'United States Treasury'"],
    },
    never: {
      en: ["Text, email or DM you first about a refund or a bill", "Demand gift cards, crypto or a wire transfer", "Threaten to send police or immigration officers", "Ask for your bank login to 'deposit a refund'"],
      es: ["Escribirle primero por texto, correo o redes sobre un reembolso o deuda", "Exigir tarjetas de regalo, criptomonedas o giros", "Amenazar con enviar policía o agentes de inmigración", "Pedir el acceso a su banco para 'depositar un reembolso'"],
    },
  },
  medicare: {
    name: { en: "Medicare", es: "Medicare" },
    domains: ["medicare.gov", "cms.gov", "hhs.gov"],
    keywords: ["medicare", "medicare card", "tarjeta de medicare", "part d", "parte d", "mbi"],
    verify: { phone: "1-800-633-4227", url: "https://www.medicare.gov" },
    report: { label: { en: "HHS Office of Inspector General", es: "Oficina del Inspector General de HHS" }, url: "https://oig.hhs.gov/fraud/report-fraud/", phone: "1-800-447-8477" },
    does: {
      en: ["Mails Medicare cards for free", "Calls only if you asked them to call you back"],
      es: ["Envía las tarjetas de Medicare gratis por correo", "Llama solo si usted pidió que le devolvieran la llamada"],
    },
    never: {
      en: ["Charge for a new Medicare card", "Call out of the blue asking for your Medicare number", "Offer free gifts or genetic tests for your number"],
      es: ["Cobrar por una tarjeta nueva de Medicare", "Llamar sin aviso pidiendo su número de Medicare", "Ofrecer regalos o pruebas genéticas a cambio de su número"],
    },
  },
  medical: {
    name: { en: "Medi-Cal (California DHCS)", es: "Medi-Cal (DHCS de California)" },
    domains: ["dhcs.ca.gov", "ca.gov", "benefitscal.com"],
    keywords: ["medi-cal", "medical", "medi cal", "dhcs", "renewal packet", "paquete de renovación", "renovación de medi-cal"],
    verify: { phone: "1-800-541-5555", url: "https://www.dhcs.ca.gov/services/medi-cal" },
    report: { label: { en: "DHCS Medi-Cal fraud hotline", es: "Línea de fraude de Medi-Cal (DHCS)" }, url: "https://www.dhcs.ca.gov/individuals/stop-medi-cal-fraud-complaint-form/", phone: "1-800-822-6222" },
    does: {
      en: ["Renews coverage through your county office, usually by mail", "Is free or low-cost; renewal never costs a fee"],
      es: ["Renueva la cobertura por medio de su oficina del condado, casi siempre por correo", "Es gratis o de bajo costo; renovar nunca cuesta"],
    },
    never: {
      en: ["Charge a fee to keep or renew Medi-Cal", "Ask for payment by gift card or app transfer", "Cancel you by text with a link to 'stop' it"],
      es: ["Cobrar por mantener o renovar Medi-Cal", "Pedir pago con tarjeta de regalo o transferencia por app", "Cancelarle por texto con un enlace para 'evitarlo'"],
    },
  },
  coveredca: {
    name: { en: "Covered California", es: "Covered California" },
    domains: ["coveredca.com"],
    keywords: ["covered california", "covered ca", "coveredca", "obamacare", "marketplace", "health plan premium"],
    verify: { phone: "1-800-300-1506", url: "https://www.coveredca.com" },
    report: { label: { en: "California Department of Insurance (consumer line and fraud reports)", es: "Departamento de Seguros de California (línea al consumidor y fraude)" }, url: "https://www.insurance.ca.gov/0300-fraud/", phone: "1-800-927-4357" },
    does: {
      en: ["Lets you enroll free with certified enrollers", "Sends premium bills from your own health plan"],
      es: ["Le deja inscribirse gratis con consejeros certificados", "Las facturas de prima vienen de su propio plan de salud"],
    },
    never: {
      en: ["Charge you to apply or enroll", "Demand payment by gift card, crypto or wire"],
      es: ["Cobrarle por aplicar o inscribirse", "Exigir pago con tarjeta de regalo, criptomonedas o giro"],
    },
  },
  calfresh: {
    name: { en: "CalFresh (food benefits, county HHSA)", es: "CalFresh (beneficios de comida, HHSA del condado)" },
    domains: ["cdss.ca.gov", "ca.gov", "benefitscal.com", "getcalfresh.org"],
    keywords: ["calfresh", "cal fresh", "food stamps", "snap", "estampillas", "cupones de comida", "hhsa", "county social services", "servicios sociales"],
    verify: { phone: "1-877-847-3663", url: "https://www.benefitscal.com" },
    report: { label: { en: "Your county social services office (fraud line on the county website)", es: "Su oficina de servicios sociales del condado" }, url: "https://www.cdss.ca.gov/county-offices", phone: null },
    does: {
      en: ["Sends notices by mail and through your BenefitsCal account", "Asks for documents through your county worker"],
      es: ["Envía avisos por correo y por su cuenta de BenefitsCal", "Pide documentos por medio de su trabajador del condado"],
    },
    never: {
      en: ["Charge a fee to get or keep benefits", "Ask for your EBT card PIN", "Approve you for 'extra' or 'emergency' benefits by text link"],
      es: ["Cobrar por recibir o mantener beneficios", "Pedir el PIN de su tarjeta EBT", "Aprobarle beneficios 'extra' o 'de emergencia' por un enlace de texto"],
    },
  },
  ebt: {
    name: { en: "California EBT (Golden State Advantage card)", es: "EBT de California (tarjeta Golden State Advantage)" },
    domains: ["ebt.ca.gov", "ebtedge.com", "cdss.ca.gov", "ca.gov"],
    keywords: ["ebt", "golden state advantage", "ebt card", "tarjeta ebt", "card locked", "tarjeta bloqueada"],
    verify: { phone: "1-877-328-9677", url: "https://www.ebt.ca.gov" },
    report: { label: { en: "EBT Customer Service (report a stolen card or PIN)", es: "Servicio al cliente de EBT (tarjeta o PIN robado)" }, url: "https://www.ebt.ca.gov", phone: "1-877-328-9677" },
    does: {
      en: ["Lets you check your balance on the official EBT app, website or phone line", "Lets you freeze your card yourself"],
      es: ["Le deja ver su saldo en la app, sitio o línea oficial de EBT", "Le deja congelar su tarjeta usted mismo"],
    },
    never: {
      en: ["Text or call asking for your card number or PIN", "Say your card is 'locked' and send a link to unlock it"],
      es: ["Escribir o llamar pidiendo su número de tarjeta o PIN", "Decir que su tarjeta está 'bloqueada' y mandar un enlace para desbloquearla"],
    },
  },
  pge: {
    name: { en: "PG&E (incl. CARE / FERA discounts)", es: "PG&E (incluye descuentos CARE / FERA)" },
    domains: ["pge.com"],
    keywords: ["pg&e", "pge", "pg and e", "care discount", "fera", "disconnect", "desconexión", "desconexion", "power will be shut off", "luz", "electricity", "electricidad", "utility"],
    verify: { phone: "1-877-660-6789", url: "https://www.pge.com" },
    report: { label: { en: "PG&E scam line (1-833-500-SCAM)", es: "Línea de estafas de PG&E (1-833-500-SCAM)" }, url: "https://www.pge.com/en/account/customer-service/scams.html", phone: "1-833-500-7226" },
    does: {
      en: ["Sends written past-due notices well before any shutoff", "Enrolls you in CARE/FERA for free at pge.com"],
      es: ["Envía avisos por escrito mucho antes de cualquier corte", "Le inscribe gratis en CARE/FERA en pge.com"],
    },
    never: {
      en: ["Threaten to cut power within the hour unless you pay now", "Ask for prepaid cards, crypto or app payments", "Charge a fee to sign up for CARE or FERA"],
      es: ["Amenazar con cortar la luz en una hora si no paga ya", "Pedir tarjetas prepagadas, criptomonedas o pagos por app", "Cobrar por inscribirse en CARE o FERA"],
    },
  },
  lifeline: {
    name: { en: "Lifeline phone/internet discount", es: "Descuento Lifeline de teléfono/internet" },
    domains: ["californialifeline.com", "lifelinesupport.org", "fcc.gov", "cpuc.ca.gov", "usac.org"],
    keywords: ["lifeline", "acp", "affordable connectivity", "free phone", "teléfono gratis", "telefono gratis", "free tablet", "internet discount", "free internet"],
    verify: { phone: "1-877-858-7463", url: "https://www.californialifeline.com" },
    report: { label: { en: "FCC consumer complaints", es: "Quejas al consumidor de la FCC" }, url: "https://consumercomplaints.fcc.gov", phone: "1-888-225-5322" },
    does: {
      en: ["Gives a monthly phone or internet discount through a participating company", "Is free to apply for"],
      es: ["Da un descuento mensual de teléfono o internet por medio de una compañía participante", "Aplicar es gratis"],
    },
    never: {
      en: ["Charge a fee to enroll", "Offer the Affordable Connectivity Program (ACP) — it stopped taking new sign-ups in 2024 and ran out of money", "Need your bank login"],
      es: ["Cobrar por inscribirse", "Ofrecer el programa ACP — dejó de inscribir en 2024 y se acabaron los fondos", "Necesitar el acceso a su banco"],
    },
  },
  dmv: {
    name: { en: "California DMV", es: "DMV de California" },
    domains: ["dmv.ca.gov", "ca.gov"],
    keywords: ["dmv", "driver's license", "licencia de conducir", "registration", "registro del vehículo", "traffic ticket", "multa", "toll", "peaje", "fastrak"],
    verify: { phone: "1-800-777-0133", url: "https://www.dmv.ca.gov" },
    report: { label: { en: "FBI Internet Crime Complaint Center (text scams)", es: "Centro de Quejas de Delitos por Internet del FBI" }, url: "https://www.ic3.gov", phone: null },
    does: {
      en: ["Sends renewal notices by mail or email you signed up for", "Takes payments only at dmv.ca.gov or in person"],
      es: ["Envía avisos de renovación por correo o por el email que usted registró", "Solo acepta pagos en dmv.ca.gov o en persona"],
    },
    never: {
      en: ["Text you about an 'unpaid toll' or 'traffic violation' with a link to pay", "Threaten to suspend your license by text tonight"],
      es: ["Mandar texto sobre un 'peaje sin pagar' o 'infracción' con un enlace para pagar", "Amenazar por texto con suspender su licencia esta noche"],
    },
  },
  edd: {
    name: { en: "California EDD (unemployment / disability)", es: "EDD de California (desempleo / incapacidad)" },
    domains: ["edd.ca.gov", "ca.gov"],
    keywords: ["edd", "unemployment", "desempleo", "state disability", "sdi", "paid family leave"],
    verify: { phone: "1-800-300-5616", url: "https://edd.ca.gov" },
    report: { label: { en: "EDD fraud hotline", es: "Línea de fraude del EDD" }, url: "https://edd.ca.gov/en/about_edd/fraud", phone: "1-800-229-6297" },
    does: {
      en: ["Uses your myEDD account for messages", "Pays benefits to the debit card or bank you chose"],
      es: ["Usa su cuenta myEDD para mensajes", "Paga a la tarjeta o banco que usted eligió"],
    },
    never: {
      en: ["Ask for a fee to release benefits", "Text a link asking you to 'verify identity' to unlock a payment"],
      es: ["Cobrar para liberar beneficios", "Mandar un enlace por texto para 'verificar su identidad' y desbloquear un pago"],
    },
  },
};

// Where anyone can report a scam, regardless of which agency was faked.
export const GENERAL_REPORT = [
  { id: "ftc", label: { en: "Federal Trade Commission", es: "Comisión Federal de Comercio (FTC)" }, url: "https://reportfraud.ftc.gov", phone: "1-877-382-4357" },
  { id: "caag", label: { en: "California Attorney General", es: "Procurador General de California" }, url: "https://oag.ca.gov/report", phone: "1-800-952-5225" },
  { id: "spam", label: { en: "Forward a scam text to 7726 (SPAM) — free on all major carriers", es: "Reenvíe el texto falso al 7726 (SPAM) — gratis en las compañías principales" }, url: null, phone: "7726" },
];

// Every hostname this app trusts, for link checks and for scrubbing model output.
export const OFFICIAL_DOMAINS = [
  ...new Set([
    ...Object.values(AGENCIES).flatMap((a) => a.domains),
    "ftc.gov", "reportfraud.ftc.gov", "oag.ca.gov", "ic3.gov", "insurance.ca.gov",
  ]),
];

export function allowedPhones() {
  const set = new Set();
  const add = (p) => p && set.add(digits(p));
  for (const a of Object.values(AGENCIES)) { add(a.verify.phone); add(a.report.phone); }
  for (const r of GENERAL_REPORT) add(r.phone);
  return set;
}

export function digits(s) {
  const d = String(s).replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
}

export function isOfficialHost(host) {
  const h = String(host).toLowerCase().replace(/\.$/, "");
  return OFFICIAL_DOMAINS.some((d) => h === d || h.endsWith("." + d));
}
