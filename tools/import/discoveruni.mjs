/**
 * Discover Uni importer.
 *
 * Discover Uni (HESA / Office for Students) publishes UK higher-education data at
 * COURSE level — roughly 39,000 rows per measure. This aggregates it to INSTITUTION
 * level so it can feed the site's university records.
 *
 * Source: https://www.discoveruni.gov.uk/about-our-data/  (dataset "DiscoverUni_latest.zip")
 * Field structure: https://www.hesa.ac.uk/collection/C25061/filestructure
 *
 * Usage:  node tools/import/discoveruni.mjs <path-to-extracted-csv-dir> [--json out.json]
 *
 * Nothing here writes to data/ directly — it prints a report and optionally a JSON
 * intermediate, so the numbers can be inspected before they become site data.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.argv[2];
if (!DIR) {
  console.error('Usage: node tools/import/discoveruni.mjs <csv-dir> [--json out.json]');
  process.exit(1);
}
const jsonFlag = process.argv.indexOf('--json');
const JSON_OUT = jsonFlag > -1 ? process.argv[jsonFlag + 1] : null;

/** Minimal RFC4180-ish CSV parser — the files contain quoted fields with commas. */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function load(name) {
  const rows = parseCSV(readFileSync(join(DIR, name), 'utf8'));
  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(v => v !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/**
 * CAH (Common Aggregation Hierarchy) level-1 groups mapped onto the site's
 * field-of-study ids. CAH23 (combined and general studies) has no equivalent
 * and is deliberately dropped.
 */
const CAH_TO_FIELD = {
  CAH01: 'medicine',        CAH02: 'medicine',          CAH03: 'life-sciences',
  CAH04: 'psychology',      CAH05: 'life-sciences',     CAH06: 'environment',
  CAH07: 'physical-sciences', CAH09: 'mathematics',     CAH10: 'engineering',
  CAH11: 'computer-science', CAH13: 'architecture',     CAH15: 'social-sciences',
  CAH16: 'law',             CAH17: 'business',          CAH19: 'humanities',
  CAH20: 'humanities',      CAH22: 'education',         CAH24: 'media',
  CAH25: 'arts',            CAH26: 'environment'
};

const num = v => {
  const n = Number(v);
  return v === '' || v == null || Number.isNaN(n) ? null : n;
};

const round = (v, dp) => v == null ? null : Math.round(v * 10 ** dp) / 10 ** dp;

/**
 * UCAS tariff bands. Keys are the lower bound of each band; the value is the
 * midpoint used to compute a mean. The open-ended top band is given 208, a little
 * above its 192 floor and close to the observed A*A*A* ceiling.
 */
const TARIFF_BANDS = {
  T001: 24, T048: 56, T064: 72, T080: 88, T096: 104, T112: 120,
  T128: 136, T144: 152, T160: 168, T176: 184, T192: 208
};

/** Population-weighted mean, so a 500-student course outweighs a 12-student one. */
function weightedMean(entries) {
  let sum = 0, weight = 0;
  for (const { value, pop } of entries) {
    if (value == null) continue;
    const w = pop && pop > 0 ? pop : 1;
    sum += value * w;
    weight += w;
  }
  return weight ? sum / weight : null;
}

// ---------------------------------------------------------------- institutions
const institutions = new Map();
for (const r of load('INSTITUTION.csv')) {
  if (!r.PUBUKPRN) continue;
  institutions.set(r.PUBUKPRN, {
    pubukprn: r.PUBUKPRN,
    ukprn: r.UKPRN,
    name: (r.FIRST_TRADING_NAME || r.LEGAL_NAME || '').trim() || r.LEGAL_NAME,
    legalName: r.LEGAL_NAME,
    address: r.PROVADDRESS,
    url: (r.PROVURL || '').trim(),
    country: r.COUNTRY,
    courses: 0,
    tariff: [], employment: [], salary: [], satisfaction: [], continuation: [],
    bands: new Map(), bandPop: 0,
    subjects: new Map()
  });
}

// ------------------------------------------------------------------- tariff
for (const r of load('TARIFF.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst) continue;
  const pop = num(r.TARPOP);
  if (!pop) continue;
  let total = 0, pct = 0;
  for (const [band, midpoint] of Object.entries(TARIFF_BANDS)) {
    const p = num(r[band]);
    if (p == null) continue;
    total += midpoint * p;
    pct += p;
  }
  // Bands should sum to ~100; far off means a partially suppressed row.
  if (pct >= 90) {
    inst.tariff.push({ value: total / pct, pop });
    for (const band of Object.keys(TARIFF_BANDS)) {
      const p = num(r[band]);
      if (p != null) inst.bands.set(band, (inst.bands.get(band) ?? 0) + (p / 100) * pop);
    }
    inst.bandPop += pop;
  }
}

// --------------------------------------------------------------- employment
for (const r of load('EMPLOYMENT.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst) continue;
  const pop = num(r.EMPPOP);
  // WORKSTUDY is already the combined "in work and/or further study" figure:
  // WORKSTUDY + UNEMP + PREVWORKSTUD + NOAVAIL sums to exactly 100, and
  // WORK + STUDY + BOTH reproduces WORKSTUDY. Adding them together triple-counts.
  const workOrStudy = num(r.WORKSTUDY);
  if (!pop || workOrStudy == null) continue;
  inst.employment.push({ value: workOrStudy, pop });
}

// ------------------------------------------------------------------- salary
for (const r of load('LEO3.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst) continue;
  const pop = num(r.LEO3POP), med = num(r.LEO3INSTMED);
  if (!pop || med == null) continue;
  inst.salary.push({ value: med, pop });
}

// ------------------------------------------------------- student satisfaction
for (const r of load('NSS.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst) continue;
  const pop = num(r.NSSPOP);
  if (!pop) continue;
  const qs = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10']
    .map(q => num(r[q])).filter(v => v != null);
  if (qs.length >= 5) inst.satisfaction.push({ value: qs.reduce((a, b) => a + b, 0) / qs.length, pop });
}

// ------------------------------------------------------------- continuation
for (const r of load('CONTINUATION.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst) continue;
  const pop = num(r.CONTPOP), cont = num(r.UCONT);
  if (!pop || cont == null) continue;
  inst.continuation.push({ value: cont, pop });
}

// ------------------------------------------------------------------ subjects
// CAH = Common Aggregation Hierarchy; the first block identifies the broad group.
for (const r of load('SBJ.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (!inst || !r.SBJ) continue;
  const cah = r.SBJ.slice(0, 5);
  inst.subjects.set(cah, (inst.subjects.get(cah) ?? 0) + 1);
}

for (const r of load('KISCOURSE.csv')) {
  const inst = institutions.get(r.PUBUKPRN);
  if (inst) inst.courses += 1;
}

// ----------------------------------------------------------------- TEF, place
const tef = new Map();
for (const r of load('TEFOutcome.csv')) {
  if (r.PUBUKPRN) tef.set(r.PUBUKPRN, {
    overall: r.OVERALL_RATING, experience: r.STUDENT_EXPERIENCE_RATING, outcomes: r.STUDENT_OUTCOMES_RATING
  });
}
const places = new Map();
for (const r of load('LOCATION.csv')) {
  const lat = num(r.LATITUDE), lon = num(r.LONGITUDE);
  if (!r.UKPRN || lat == null) continue;
  if (!places.has(r.UKPRN)) places.set(r.UKPRN, { name: r.LOCNAME, lat, lon });
}

// ------------------------------------------------------------------ assemble
const out = [...institutions.values()].map(inst => {
  const t = tef.get(inst.pubukprn);
  const place = places.get(inst.ukprn) || places.get(inst.pubukprn);
  return {
    pubukprn: inst.pubukprn, ukprn: inst.ukprn,
    name: inst.name, legalName: inst.legalName, address: inst.address,
    url: inst.url, country: inst.country, courses: inst.courses,
    meanTariff: round(weightedMean(inst.tariff), 1),
    tariffCourses: inst.tariff.length,
    employmentPct: round(weightedMean(inst.employment), 1),
    medianSalary3yr: round(weightedMean(inst.salary), 0),
    satisfactionPct: round(weightedMean(inst.satisfaction), 1),
    continuationPct: round(weightedMean(inst.continuation), 1),
    tef: t?.overall ?? null, tefExperience: t?.experience ?? null, tefOutcomes: t?.outcomes ?? null,
    lat: place?.lat ?? null, lon: place?.lon ?? null,
    entryBands: bandShares(inst),
    shareTariff144Plus: shareAtOrAbove(inst, 144),
    shareTariff160Plus: shareAtOrAbove(inst, 160),
    fields: fieldsFor(inst),
    strongFields: fieldsFor(inst, 0.15),
    subjectGroups: [...inst.subjects.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`)
  };
}).sort((a, b) => (b.meanTariff ?? 0) - (a.meanTariff ?? 0));

/** Share of entrants in each tariff band, as percentages summing to ~100. */
function bandShares(inst) {
  if (!inst.bandPop) return null;
  const out = {};
  for (const [band, weighted] of inst.bands) {
    out[band] = round((weighted / inst.bandPop) * 100, 1);
  }
  return Object.keys(out).length ? out : null;
}

/** Share of entrants whose tariff is at or above a threshold (144 = AAA). */
function shareAtOrAbove(inst, threshold) {
  if (!inst.bandPop) return null;
  let total = 0;
  for (const [band, weighted] of inst.bands) {
    const lower = Number(band.slice(1));
    if (lower >= threshold) total += weighted;
  }
  return round((total / inst.bandPop) * 100, 1);
}

/**
 * Field ids the institution teaches. With a threshold, only fields making up at
 * least that share of its courses — used to identify what it is known for.
 */
function fieldsFor(inst, minShare = 0) {
  const total = [...inst.subjects.values()].reduce((a, b) => a + b, 0);
  if (!total) return [];
  const tally = {};
  for (const [cah, n] of inst.subjects) {
    const field = CAH_TO_FIELD[cah];
    if (field) tally[field] = (tally[field] ?? 0) + n;
  }
  return Object.entries(tally)
    .filter(([, n]) => n / total >= minShare)
    .sort((a, b) => b[1] - a[1])
    .map(([f]) => f);
}

const count = (arr, fn) => arr.reduce((m, x) => { const k = fn(x) || '(none)'; m[k] = (m[k] || 0) + 1; return m; }, {});
const withTariff = out.filter(o => o.meanTariff != null);

console.log(`Institutions in file:        ${out.length}`);
console.log(`  with a mean UCAS tariff:   ${withTariff.length}`);
console.log(`  with employment outcomes:  ${out.filter(o => o.employmentPct != null).length}`);
console.log(`  with a graduate salary:    ${out.filter(o => o.medianSalary3yr != null).length}`);
console.log(`  with NSS satisfaction:     ${out.filter(o => o.satisfactionPct != null).length}`);
console.log(`  with a TEF rating:         ${out.filter(o => o.tef).length}`);
console.log(`  with coordinates:          ${out.filter(o => o.lat != null).length}`);
console.log(`\nBy UK nation: ${JSON.stringify(count(out, o => o.country))}`);
console.log(`TEF ratings:  ${JSON.stringify(count(out.filter(o => o.tef), o => o.tef))}`);
console.log('\nTop 15 by mean UCAS tariff:');
withTariff.slice(0, 15).forEach(o =>
  console.log(`  ${String(o.meanTariff).padStart(6)}  ${o.name.slice(0, 42).padEnd(44)}` +
              `emp ${String(o.employmentPct ?? '—').padStart(5)}%  £${String(o.medianSalary3yr ?? '—').padStart(6)}  ${o.tef ?? '—'}`));

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
  console.log(`\nWrote ${out.length} institutions to ${JSON_OUT}`);
}
