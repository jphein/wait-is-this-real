// Fetches each agency's official page(s) and checks the knowledge-base phone number appears there.
// node scripts/verify-kb.mjs   (network; prints a table; exit 1 if any check fails to find its number)
import { AGENCIES, GENERAL_REPORT, digits } from "../public/js/kb.js";

const UA = { "user-agent": "Mozilla/5.0 (wait-is-this-real KB check; +https://github.com/jphein/wait-is-this-real)" };
// Pages where each number is published (some agencies list it on a contact page, not the home page).
const SOURCES = {
  "ssa.verify": ["https://www.ssa.gov/agency/contact/"],
  "ssa.report": ["https://oig.ssa.gov/report/", "https://oig.ssa.gov/"],
  "irs.verify": ["https://www.irs.gov/help/telephone-assistance"],
  "irs.report": ["https://www.tigta.gov/reportcrime-misconduct", "https://www.tigta.gov/"],
  "medicare.verify": ["https://www.medicare.gov/talk-to-someone"],
  "medicare.report": ["https://oig.hhs.gov/fraud/report-fraud/"],
  "medical.verify": ["https://www.dhcs.ca.gov/services/medi-cal/Pages/Medi-Cal_Contact_Us.aspx", "https://www.dhcs.ca.gov/services/medi-cal"],
  "medical.report": ["https://www.dhcs.ca.gov/individuals/stop-medi-cal-fraud-complaint-form/"],
  "coveredca.verify": ["https://www.coveredca.com/support/contact-us/", "https://www.coveredca.com"],
  "coveredca.report": ["https://www.insurance.ca.gov/0300-fraud/"],
  "calfresh.verify": ["https://www.cdss.ca.gov/calfresh", "https://www.cdss.ca.gov/inforesources/calfresh"],
  "ebt.verify": ["https://www.ebt.ca.gov/", "https://www.ebt.ca.gov/contact.html"],
  "pge.verify": ["https://www.pge.com/en/contact-us.html"],
  "pge.report": ["https://www.pge.com/en/account/customer-service/scams.html"],
  "lifeline.verify": ["https://www.cpuc.ca.gov/consumer-support/financial-assistance-savings-and-discounts/lifeline/california-lifeline-contacts"],
  "lifeline.report": ["https://consumercomplaints.fcc.gov/hc/en-us", "https://www.fcc.gov/consumers"],
  "dmv.verify": ["https://www.dmv.ca.gov/portal/customer-service/", "https://www.dmv.ca.gov/portal/contact-us/"],
  "edd.report": ["https://edd.ca.gov/en/about_edd/fraud"],
  "edd.verify": ["https://edd.ca.gov/en/unemployment/contact/", "https://edd.ca.gov/en/about_edd/contact_edd/"],
  "general.ftc": ["https://reportfraud.ftc.gov/", "https://consumer.ftc.gov/articles/how-avoid-scam"],
  "general.caag": ["https://oag.ca.gov/contact/consumer-complaint-against-business-or-company", "https://oag.ca.gov/consumers"],
};
const words = { "500-7226": "500-SCAM", "633-4227": "MEDICARE", "447-8477": "HHS-TIPS", "382-4357": "FTC-HELP", "225-5322": "CALL-FCC", "927-4357": "927-HELP" };

const checks = [];
for (const [id, a] of Object.entries(AGENCIES)) {
  if (a.verify.phone) checks.push([`${id}.verify`, a.verify.phone]);
  if (a.report.phone && a.report.phone !== a.verify.phone) checks.push([`${id}.report`, a.report.phone]);
}
for (const g of GENERAL_REPORT) if (g.phone && g.phone.length > 6) checks.push([`general.${g.id}`, g.phone]);

let bad = 0;
for (const [key, phone] of checks) {
  const want = digits(phone);
  const tail = `${want.slice(3, 6)}-${want.slice(6)}`;
  let found = null, tried = [];
  for (const url of SOURCES[key] || []) {
    try {
      const res = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) });
      const html = await res.text();
      tried.push(`${res.status}`);
      const flat = html.replace(/&nbsp;|&#160;/g, " ");
      const nums = (flat.match(/\d[\d\s().-]{8,16}\d/g) || []).map(digits);
      if (nums.includes(want) || (words[tail] && flat.toUpperCase().includes(words[tail]))) { found = url; break; }
    } catch (e) { tried.push(e.name); }
  }
  if (!found) bad++;
  console.log(`${found ? "✓" : "?"} ${key.padEnd(18)} ${phone.padEnd(16)} ${found ?? `not found (${tried.join(",") || "no source"})`}`);
}
console.log(`\n${checks.length - bad}/${checks.length} numbers found on an official page`);
process.exit(bad ? 1 : 0);
