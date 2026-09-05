/**
 * Eurostat importer — country-level education and labour-market context.
 *
 * These datasets are national statistics, not university data, so they enrich
 * data/reference/countries.js rather than adding universities.
 *
 *   tps00053   Employment rate of recent graduates (ISCED 3-8, aged 20-34,
 *              1-3 years after leaving education), %
 *   tipslm90   Young people neither in employment nor in education or
 *              training (NEET), aged 15-29, % of population
 *   sdg_04_10  Early leavers from education and training, aged 18-24, %
 *
 * Source: https://ec.europa.eu/eurostat/databrowser/  (TSV, gzipped)
 * Usage:  node tools/import/eurostat.mjs <dir-with-estat_*.tsv.gz>
 */
import { readFileSync, readdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIR = process.argv[2];
if (!DIR) { console.error('Usage: node tools/import/eurostat.mjs <dir>'); process.exit(1); }

/**
 * Eurostat TSV: the first column packs the dimensions, the rest are years.
 * Values carry flag letters (b = break in series, u = low reliability, : = missing)
 * which must be stripped before parsing.
 */
function parseEurostat(buf) {
  const lines = gunzipSync(buf).toString('utf8').trim().split('\n');
  const header = lines[0].split('\t').map(h => h.trim());
  const dimNames = header[0].split('\\')[0].split(',');
  const years = header.slice(1).map(y => y.trim());

  return lines.slice(1).map(line => {
    const cells = line.split('\t');
    const dims = Object.fromEntries(cells[0].split(',').map((v, i) => [dimNames[i], v.trim()]));
    const values = {};
    cells.slice(1).forEach((raw, i) => {
      const cleaned = raw.replace(/[a-zA-Z:]/g, '').trim();
      const n = Number(cleaned);
      if (cleaned !== '' && !Number.isNaN(n)) values[years[i]] = n;
    });
    return { dims, values };
  });
}

/** The most recent year with an actual value. */
function latest(values) {
  const years = Object.keys(values).map(Number).sort((a, b) => b - a);
  return years.length ? { year: years[0], value: values[String(years[0])] } : null;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.tsv.gz'));
const pick = key => files.find(f => f.includes(key));

const out = {};
const record = (geo, field, hit, dataset) => {
  if (!hit) return;
  out[geo] ??= {};
  out[geo][field] = hit.value;
  out[geo][field + 'Year'] = hit.year;
  out[geo].sources ??= {};
  out[geo].sources[field] = dataset;
};

/**
 * Each file carries several series per country. Filtering on `unit` is essential:
 * tipslm90 ships both PC_POP (the NEET rate) and PPCH_3Y (its 3-year change in
 * percentage points). Without the filter the change silently overwrites the rate,
 * which is how a NEET rate ends up reading 1.2% — or negative.
 */

// --- graduate employment rate ------------------------------------------------
for (const row of parseEurostat(readFileSync(join(DIR, pick('tps00053'))))) {
  if (row.dims.sex !== 'T' || row.dims.unit !== 'PC') continue;
  record(row.dims.geo, 'graduateEmployment', latest(row.values), 'tps00053');
}

// --- NEET rate ---------------------------------------------------------------
for (const row of parseEurostat(readFileSync(join(DIR, pick('tipslm90'))))) {
  if (row.dims.sex !== 'T' || row.dims.unit !== 'PC_POP') continue;
  record(row.dims.geo, 'neetRate', latest(row.values), 'tipslm90');
}

// --- early leavers from education --------------------------------------------
for (const row of parseEurostat(readFileSync(join(DIR, pick('sdg_04_10'))))) {
  if (row.dims.sex !== 'T' || row.dims.unit !== 'PC') continue;
  record(row.dims.geo, 'earlyLeavers', latest(row.values), 'sdg_04_10');
}

const codes = Object.keys(out).sort();
console.log(`Countries with at least one figure: ${codes.length}\n`);
console.log('geo   grad-employment   NEET    early-leavers');
for (const c of codes) {
  const d = out[c];
  const f = (v, y) => v == null ? '     —      ' : `${String(v).padStart(5)}% (${y})`;
  console.log(`${c.padEnd(6)}${f(d.graduateEmployment, d.graduateEmploymentYear)}  ` +
              `${f(d.neetRate, d.neetRateYear)}  ${f(d.earlyLeavers, d.earlyLeaversYear)}`);
}

const jsonFlag = process.argv.indexOf('--json');
if (jsonFlag > -1) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(process.argv[jsonFlag + 1], JSON.stringify(out, null, 1));
  console.log(`\nWrote ${codes.length} countries to ${process.argv[jsonFlag + 1]}`);
}
