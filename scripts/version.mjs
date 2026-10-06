// Writes public/version.json in the realm-sigil contract (deterministic version name from the git hash).
// Uses the sigil library when it's checked out beside this repo (REALM_SIGIL_JS), else a plain fallback.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8" }).trim(); } catch { return null; } };
const hash = git("rev-parse", "--short", "HEAD") || "dev";
const branch = git("rev-parse", "--abbrev-ref", "HEAD") || "unknown";
const dirty = git("status", "--porcelain") ? true : false;
const opts = {
  name: "wait-is-this-real",
  description: "Bilingual scam checker for benefits-and-bills messages",
  realm: "forge",
  repo: "https://github.com/jphein/wait-is-this-real",
  hash, branch, dirty, built: new Date().toISOString(),
};
let out;
try {
  const require = createRequire(import.meta.url);
  const sigil = require(resolve(process.env.REALM_SIGIL_JS || "../realm-sigil/js/index.js"));
  out = sigil.versionObject(opts);
} catch {
  out = { ...opts, version: hash, commit_url: hash !== "dev" ? `${opts.repo}/commit/${hash}` : "" };
}
writeFileSync(new URL("../public/version.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`version.json: ${out.version} (${hash}${dirty ? ", dirty" : ""})`);
