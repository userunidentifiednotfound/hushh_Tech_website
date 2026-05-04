/**
 * Local helper — runs the same logic as check-pr-hygiene.mjs
 * against a PR body file passed as argv[2].
 *
 * Usage: node scripts/ci/check-pr-body-local.mjs .kiro/pr-bodies/pr6-desktop-layout.md
 */
import fs from "node:fs";

const bodyFile = process.argv[2];
if (!bodyFile) { console.error("Usage: node check-pr-body-local.mjs <body-file>"); process.exit(1); }

const body = fs.readFileSync(bodyFile, "utf8");
const title = bodyFile; // we only care about body checks here

const errors = [];
const warnings = [];
const allowedRiskAreas = new Set(["ui","api","auth","deploy","security","docs","data","infra","ci"]);

function getSectionContent(markdown, heading) {
  const lines = markdown.split("\n");
  const startIndex = lines.findIndex((line) => line.trim() === heading);
  if (startIndex === -1) return "";
  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index++) {
    if (lines[index].startsWith("## ")) break;
    sectionLines.push(lines[index]);
  }
  return sectionLines.join("\n").trim();
}

function getMeaningfulBullets(section, ignoredPhrases) {
  return section.split("\n").map(l=>l.trim()).filter(l=>l.startsWith("- ")).filter(l=>!/^- \[[ xX]\]/.test(l)).map(l=>l.slice(2).trim()).filter(l=>l.length>0).filter(l=>!/^[^:]+:\s*$/.test(l)).filter(l=>!ignoredPhrases.includes(l.toLowerCase()));
}

function getKeyedBullets(section) {
  return section.split("\n").map(l=>l.trim()).filter(l=>l.startsWith("- ")).filter(l=>!/^- \[[ xX]\]/.test(l)).reduce((acc,line)=>{const m=line.match(/^- ([^:]+):\s*(.*)$/);if(m)acc[m[1].trim().toLowerCase()]=m[2].trim();return acc;},{});
}

function isPlaceholderValue(value) {
  const n=String(value||"").trim().toLowerCase();
  return n.length===0||["tbd","todo","n/a","na","none","-","same as title","same as above"].includes(n);
}

function hasConcreteText(value, min=10) {
  return String(value||"").trim().length>=min && !isPlaceholderValue(value);
}

function hasTraceabilityReference(value) {
  const v=String(value||"").trim();
  return /#\d+/.test(v)||/\b[A-Z]{2,}-\d+\b/.test(v)||/https?:\/\/\S+/.test(v);
}

function hasExplicitNoIssueReason(value) {
  return /\b(?:none|n\/a|not applicable)\b/i.test(String(value||"")) && String(value||"").trim().length>=12;
}

function parseRiskAreas(value) {
  return String(value||"").split(/[|,/]/).map(e=>e.replace(/`/g,"").trim().toLowerCase()).filter(Boolean);
}

const ignoredSummary = ["what changed","why it changed","linked issue: `#123` | `none - reason`","acceptance criteria covered","risk area touched: `ui` | `api` | `auth` | `deploy` | `security` | `docs` | `data` | `infra` | `ci`","reviewer focus"];
const ignoredNotes = ["deployment impact","migration or env requirements","rollback or release notes","follow-up work if any","reviewer callouts or codeowners you expect to review this"];

const summarySection = getSectionContent(body, "## Summary");
const validationSection = getSectionContent(body, "## Validation");
const notesSection = getSectionContent(body, "## Notes");

const summaryBullets = getMeaningfulBullets(summarySection, ignoredSummary);
const notesBullets = getMeaningfulBullets(notesSection, ignoredNotes);
const summaryFields = getKeyedBullets(summarySection);
const validationFields = getKeyedBullets(validationSection);
const checklistItems = validationSection.split("\n").map(l=>l.trim()).filter(l=>/^- \[[ xX]\]/.test(l));
const checkedItems = checklistItems.filter(l=>/^- \[[xX]\]/.test(l));

console.log(`\nSummary meaningful bullets: ${summaryBullets.length} (need >= 2)`);
summaryBullets.forEach(b=>console.log("  >>",b));
console.log(`Notes meaningful bullets: ${notesBullets.length} (need >= 1)`);
notesBullets.forEach(b=>console.log("  >>",b));
console.log(`Checklist items: ${checklistItems.length} (need >= 3), checked: ${checkedItems.length} (need >= 1)`);
console.log("\nSummary keyed fields:");
Object.entries(summaryFields).forEach(([k,v])=>console.log(`  [${k}] = "${v.substring(0,100)}"`));
console.log("\nValidation keyed fields:");
Object.entries(validationFields).forEach(([k,v])=>console.log(`  [${k}] = "${v.substring(0,100)}"`));

// --- Run all checks ---
for (const heading of ["## Summary","## Validation","## Notes"]) {
  if (!body.includes(heading)) errors.push(`Missing heading: ${heading}`);
}

if (summaryBullets.length < 2) errors.push(`Need >= 2 meaningful summary bullets, got ${summaryBullets.length}`);
if (notesBullets.length < 1) errors.push(`Need >= 1 meaningful notes bullet, got ${notesBullets.length}`);
if (checklistItems.length < 3) errors.push(`Need >= 3 checklist items, got ${checklistItems.length}`);
if (!checkedItems.length) errors.push("Need >= 1 checked checklist item");

for (const [label, min] of [["what changed",10],["why it changed",10],["linked issue",4],["acceptance criteria covered",10],["risk area touched",2]]) {
  if (!hasConcreteText(summaryFields[label], min)) errors.push(`Summary "${label}" too short/placeholder: "${summaryFields[label]}"`);
}

const li = summaryFields["linked issue"];
if (!hasTraceabilityReference(li)) {
  if (hasExplicitNoIssueReason(li)) warnings.push(`Linked issue explicitly none — allowed but traceability preferred`);
  else errors.push(`Summary "linked issue" needs #ref, ticket, URL, or explicit none reason (len>=12). Got: "${li}"`);
}

const riskAreas = parseRiskAreas(summaryFields["risk area touched"]);
if (!riskAreas.length || riskAreas.some(e=>!allowedRiskAreas.has(e))) {
  errors.push(`"risk area touched" invalid. Got: "${summaryFields["risk area touched"]}" -> bad parts: ${riskAreas.filter(e=>!allowedRiskAreas.has(e)).join(",")}`);
}

for (const [label, min] of [["ran",8],["reviewer should verify",8]]) {
  if (!hasConcreteText(validationFields[label], min)) errors.push(`Validation "${label}" too short: "${validationFields[label]}"`);
}

if (!hasConcreteText(validationFields["did not run"], 4)) warnings.push(`Validation "did not run" missing — say "none" if everything was covered`);

console.log("\n--- RESULT ---");
warnings.forEach(w=>console.log("WARNING:", w));
if (!errors.length) { console.log("ALL CHECKS PASSED ✓"); process.exit(0); }
errors.forEach(e=>console.error("ERROR:", e));
process.exit(1);
