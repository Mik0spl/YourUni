/**
 * Turns the importer output into the two generated data files the site loads.
 *
 *   data/reference/country-stats.js   national figures from Eurostat
 *   data/universities/uk-outcomes.js  per-institution outcomes from Discover Uni
 *
 * Generated files are kept separate from hand-written ones and merged at load
 * time, so re-running an import can never overwrite curated data.
 *
 * Usage: node tools/import/generate.mjs <eurostat.json> <uk-institutions.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [euPath, ukPath] = process.argv.slice(2);
if (!euPath || !ukPath) {
  console.error('Usage: node tools/import/generate.mjs <eurostat.json> <uk-institutions.json>');
  process.exit(1);
}
const eurostat = JSON.parse(readFileSync(euPath, 'utf8'));
const uk = JSON.parse(readFileSync(ukPath, 'utf8'));

/** Eurostat uses a few codes that differ from the site's ISO-2 country codes. */
const GEO_TO_ISO = { EL: 'GR', UK: 'GB' };
const AGGREGATES = new Set(['EU27_2020', 'EA19', 'EA20', 'EA21', 'EU28']);

// ------------------------------------------------------------ country stats
const countryLines = [];
for (const [geo, d] of Object.entries(eurostat).sort()) {
  if (AGGREGATES.has(geo)) continue;
  const code = GEO_TO_ISO[geo] ?? geo;
  if (code.length !== 2) continue;
  const parts = [];
  if (d.graduateEmployment != null) parts.push(`graduateEmployment: ${d.graduateEmployment}, graduateEmploymentYear: ${d.graduateEmploymentYear}`);
  if (d.neetRate != null) parts.push(`neetRate: ${d.neetRate}, neetRateYear: ${d.neetRateYear}`);
  if (d.earlyLeavers != null) parts.push(`earlyLeavers: ${d.earlyLeavers}, earlyLeaversYear: ${d.earlyLeaversYear}`);
  if (parts.length) countryLines.push(`  ${code}: { ${parts.join(', ')} }`);
}

writeFileSync('data/reference/country-stats.js', `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node tools/import/eurostat.mjs <dir> --json eurostat.json
 *   node tools/import/generate.mjs eurostat.json uk-institutions.json
 *
 * National education and labour-market figures from Eurostat, merged into the
 * country reference data at load time.
 *
 *   graduateEmployment  employment rate of recent graduates (ISCED 3-8, 20-34,
 *                       1-3 years after leaving education), % — dataset tps00053
 *   neetRate            young people not in employment, education or training,
 *                       15-29, % of population — dataset tipslm90
 *   earlyLeavers        early leavers from education and training, 18-24, %
 *                       — dataset sdg_04_10
 *
 * Each figure carries the year it is from. UK figures stop at 2019, when the UK
 * left Eurostat reporting.
 *
 * Source: https://ec.europa.eu/eurostat/databrowser/
 */
export const countryStats = {
${countryLines.join(',\n')}
};

export const COUNTRY_STATS_SOURCE = 'Eurostat (tps00053, tipslm90, sdg_04_10)';
`);
console.log(`data/reference/country-stats.js       ${countryLines.length} countries`);

// ------------------------------------------------------------- UK outcomes
/** Site university id -> the Discover Uni institution name it corresponds to. */
const ID_TO_NAME = {
  oxford: 'Oxford University',
  cambridge: 'University of Cambridge',
  imperial: 'Imperial College London',
  ucl: 'UCL',
  lse: 'The London School of Economics and Political Science',
  edinburgh: 'University of Edinburgh',
  kcl: "King's College London",
  warwick: 'University of Warwick',
  standrews: 'University of St Andrews',
  manchester: 'University of Manchester',
  bristol: 'University of Bristol',
  durham: 'Durham University'
};

const byName = new Map(uk.map(i => [i.name, i]));
const outcomeLines = [];
const missing = [];

for (const [id, name] of Object.entries(ID_TO_NAME)) {
  const inst = byName.get(name)
    ?? uk.find(i => i.name.toLowerCase() === name.toLowerCase())
    ?? uk.find(i => (i.legalName || '').toLowerCase() === name.toLowerCase());
  if (!inst) { missing.push(`${id} (${name})`); continue; }

  const f = [];
  const push = (k, v) => { if (v != null) f.push(`${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`); };
  push('ukprn', inst.pubukprn);
  push('employmentPct', inst.employmentPct);
  push('medianSalary3yr', inst.medianSalary3yr);
  push('satisfactionPct', inst.satisfactionPct);
  push('continuationPct', inst.continuationPct);
  push('meanTariff', inst.meanTariff);
  push('shareTariff144Plus', inst.shareTariff144Plus);
  push('shareTariff160Plus', inst.shareTariff160Plus);
  push('tef', inst.tef);
  outcomeLines.push(`  ${id}: { ${f.join(', ')} }`);
}

writeFileSync('data/universities/uk-outcomes.js', `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node tools/import/discoveruni.mjs <csv-dir> --json uk-institutions.json
 *   node tools/import/generate.mjs eurostat.json uk-institutions.json
 *
 * Real published outcomes for UK universities, merged onto their records at load
 * time. Everything here is measured and attributable — none of it is estimated.
 *
 *   employmentPct       graduates in work and/or further study 15 months after
 *                       finishing, %
 *   medianSalary3yr     median earnings 3 years after graduating, GBP (LEO)
 *   satisfactionPct     mean positivity across NSS 2024-25 questions, %
 *   continuationPct     students continuing into their second year, %
 *   meanTariff          population-weighted mean UCAS tariff of entrants
 *   shareTariff144Plus  share of entrants holding AAA or better, %
 *   shareTariff160Plus  share of entrants holding A*A*A or better, %
 *   tef                 Teaching Excellence Framework overall rating
 *
 * Note there is deliberately no acceptance rate here. Discover Uni does not
 * publish one, and it cannot be derived from tariff: LSE and Bristol share a mean
 * tariff of 155 yet admit 11% and 45% of applicants respectively.
 *
 * Source: Discover Uni / HESA / Office for Students, dataset dated 2026-08-18.
 * https://www.discoveruni.gov.uk/about-our-data/
 */
export const ukOutcomes = {
${outcomeLines.join(',\n')}
};

export const UK_OUTCOMES_SOURCE = 'Discover Uni (HESA / Office for Students), August 2026';
`);
console.log(`data/universities/uk-outcomes.js      ${outcomeLines.length} universities`);
if (missing.length) console.log(`  could not match: ${missing.join(', ')}`);
