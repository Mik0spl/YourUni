/**
 * Data validator — run with `npm run validate` (or `node data/validate.mjs`)
 * after adding or editing any data file. Exits non-zero on an error.
 */
import { universities } from './universities/index.js';
import { scholarships } from './scholarships/index.js';
import { fields } from './reference/fields.js';
import { countries } from './reference/countries.js';
import { gradeSystems, admissionTests, englishTests } from './reference/grade-systems.js';
import { activities, admissionsCulture } from './reference/activities.js';

const errors = [];
const warnings = [];

const fieldIds = new Set(fields.map(f => f.id));
const countryCodes = new Set(countries.map(c => c.code));
const scholarshipIds = new Set(scholarships.map(s => s.id));
const alevelGrades = new Set(gradeSystems.find(s => s.id === 'alevel').options.map(o => o.value));

const REQUIRED = ['id', 'name', 'short', 'country', 'city', 'crest', 'initials',
  'rankGlobal', 'acceptance', 'fields', 'tuition', 'living', 'req', 'admissions', 'qol', 'blurb'];
const QOL_KEYS = ['safety', 'affordability', 'transport', 'culture', 'nature', 'studentLife'];

const seen = new Set();
for (const u of universities) {
  const at = `university "${u.id || u.name}"`;

  for (const key of REQUIRED) {
    if (u[key] === undefined || u[key] === null) errors.push(`${at}: missing required field "${key}"`);
  }
  if (seen.has(u.id)) errors.push(`${at}: duplicate id`);
  seen.add(u.id);

  if (!countryCodes.has(u.country)) errors.push(`${at}: unknown country code "${u.country}" — add it to data/reference/countries.js`);

  for (const f of u.fields || []) {
    if (!fieldIds.has(f)) errors.push(`${at}: unknown field id "${f}" — add it to data/reference/fields.js`);
  }
  for (const f of u.strongFields || []) {
    if (!fieldIds.has(f)) errors.push(`${at}: unknown strongField id "${f}"`);
    else if (!(u.fields || []).includes(f)) warnings.push(`${at}: strongField "${f}" is not listed in fields`);
  }
  for (const s of u.scholarships || []) {
    if (!scholarshipIds.has(s)) errors.push(`${at}: unknown scholarship id "${s}"`);
  }

  if (typeof u.acceptance !== 'number' || u.acceptance <= 0 || u.acceptance > 1) {
    errors.push(`${at}: acceptance must be a decimal between 0 and 1 (0.15 = 15%), got ${u.acceptance}`);
  }
  if (u.intlShare !== undefined && (u.intlShare < 0 || u.intlShare > 1)) {
    errors.push(`${at}: intlShare must be between 0 and 1`);
  }
  if (!u.tuition || typeof u.tuition.intl !== 'number' || !u.tuition.currency) {
    errors.push(`${at}: tuition needs { intl: <number>, currency: "<code>" }`);
  }
  if (u.req?.alevel && !alevelGrades.has(u.req.alevel)) {
    errors.push(`${at}: req.alevel "${u.req.alevel}" is not one of the grade combinations in grade-systems.js`);
  }
  if (u.req?.ib && (u.req.ib < 24 || u.req.ib > 45)) errors.push(`${at}: req.ib out of range (24–45)`);
  if (u.req?.gpa && (u.req.gpa < 0 || u.req.gpa > 4)) errors.push(`${at}: req.gpa out of range (0–4)`);

  for (const k of QOL_KEYS) {
    const v = u.qol?.[k];
    if (typeof v !== 'number' || v < 0 || v > 100) errors.push(`${at}: qol.${k} must be a number 0–100`);
  }
  if (!Array.isArray(u.admissions?.deadlines) || !u.admissions.deadlines.length) {
    warnings.push(`${at}: no deadlines listed`);
  }
  if (!admissionsCulture[u.country]) {
    warnings.push(`${at}: no admissionsCulture entry for "${u.country}" — the default weighting will be used`);
  }
}

const sSeen = new Set();
for (const s of scholarships) {
  const at = `scholarship "${s.id || s.name}"`;
  if (sSeen.has(s.id)) errors.push(`${at}: duplicate id`);
  sSeen.add(s.id);
  for (const key of ['name', 'provider', 'scope', 'type', 'coverage', 'eligibility']) {
    if (!s[key]) errors.push(`${at}: missing "${key}"`);
  }
  const mi = s.eligibility?.minIndex;
  if (typeof mi !== 'number' || mi < 0 || mi > 100) errors.push(`${at}: eligibility.minIndex must be 0–100`);
  if (s.country && !countryCodes.has(s.country)) errors.push(`${at}: unknown country "${s.country}"`);
  for (const f of s.eligibility?.fields || []) {
    if (!fieldIds.has(f)) errors.push(`${at}: unknown field id "${f}"`);
  }
  for (const uid of s.universities || []) {
    if (!seen.has(uid)) errors.push(`${at}: references unknown university "${uid}"`);
  }
}

for (const sys of gradeSystems) {
  const at = `grade system "${sys.id}"`;
  if (sys.kind === 'numeric') {
    if (!Array.isArray(sys.anchors) || sys.anchors.length < 3) errors.push(`${at}: needs at least 3 anchors`);
    let prev = -Infinity;
    for (const [raw, idx] of sys.anchors || []) {
      if (raw <= prev) errors.push(`${at}: anchors must be sorted by raw value ascending (${raw} follows ${prev})`);
      prev = raw;
      if (idx < 0 || idx > 100) errors.push(`${at}: anchor index ${idx} is outside 0–100`);
    }
  } else if (sys.kind === 'choice') {
    if (!sys.options?.length) errors.push(`${at}: choice systems need an options array`);
  } else {
    errors.push(`${at}: kind must be "numeric" or "choice"`);
  }
}

for (const t of [...admissionTests, ...englishTests]) {
  if (!t.anchors?.length) errors.push(`test "${t.id}": missing anchors`);
}
for (const a of activities) {
  if (typeof a.impact !== 'number' || a.impact < 0 || a.impact > 10) errors.push(`activity "${a.id}": impact must be 0–10`);
  if (a.bestFor !== 'all') {
    for (const f of a.bestFor || []) if (!fieldIds.has(f)) errors.push(`activity "${a.id}": unknown field "${f}"`);
  }
}

console.log(`Checked ${universities.length} universities, ${scholarships.length} scholarships, ` +
            `${fields.length} fields, ${countries.length} countries, ${gradeSystems.length} grade systems, ` +
            `${activities.length} activities.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach(w => console.log('  ! ' + w));
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log('\nAll data valid.');
