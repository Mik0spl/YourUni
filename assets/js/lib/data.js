/**
 * Loads the raw data files and derives everything the UI needs from them.
 * Pages import from here rather than reaching into data/ directly.
 */
import { universities as rawUniversities } from '../../../data/universities/index.js';
import { scholarships as rawScholarships } from '../../../data/scholarships/index.js';
import { fields, fieldById } from '../../../data/reference/fields.js';
import { countries, countryByCode } from '../../../data/reference/countries.js';
import { activities, activityById, activityCategories, admissionsCulture, DEFAULT_CULTURE }
  from '../../../data/reference/activities.js';
import { convert } from '../../../data/reference/currencies.js';
import { requirementIndex, englishRequirementIndex } from './grades.js';

export { fields, fieldById, countries, countryByCode, activities, activityById, activityCategories };

/** Weights for the composite quality-of-life score. */
const QOL_WEIGHTS = {
  safety: 0.22, affordability: 0.20, transport: 0.16,
  culture: 0.16, nature: 0.12, studentLife: 0.14
};

export const QOL_LABELS = {
  safety: 'Safety',
  affordability: 'Affordability',
  transport: 'Getting around',
  culture: 'Culture & food',
  nature: 'Nature access',
  studentLife: 'Student life'
};

function qolScore(qol) {
  let total = 0;
  for (const [key, weight] of Object.entries(QOL_WEIGHTS)) total += (qol[key] ?? 50) * weight;
  return Math.round(total);
}

/** Attach everything derived so the rest of the app never recomputes it. */
function decorate(u) {
  const country = countryByCode[u.country];
  const currency = u.tuition.currency;
  const tuitionIntl = u.tuition.intl ?? 0;
  const tuitionEu = u.tuition.eu ?? tuitionIntl;
  const living = u.living ?? 0;

  return {
    ...u,
    countryName: country?.name ?? u.country,
    flag: country?.flag ?? '🏳️',
    region: country?.region ?? 'Other',
    countryInfo: country,
    currency,
    totalCost: tuitionIntl + living,
    totalCostEu: tuitionEu + living,
    tuitionUSD: convert(tuitionIntl, currency, 'USD') ?? 0,
    livingUSD: convert(living, currency, 'USD') ?? 0,
    totalCostUSD: (convert(tuitionIntl, currency, 'USD') ?? 0) + (convert(living, currency, 'USD') ?? 0),
    totalCostEuUSD: (convert(tuitionEu, currency, 'USD') ?? 0) + (convert(living, currency, 'USD') ?? 0),
    qolScore: qolScore(u.qol),
    requiredIndex: requirementIndex(u),
    englishIndex: englishRequirementIndex(u),
    culture: admissionsCulture[u.country] ?? DEFAULT_CULTURE,
    searchText: [u.name, u.short, u.city, country?.name, ...(u.fields || [])].join(' ').toLowerCase()
  };
}

export const universities = rawUniversities.map(decorate).sort((a, b) => a.rankGlobal - b.rankGlobal);
export const universityById = Object.fromEntries(universities.map(u => [u.id, u]));

export const scholarships = rawScholarships;
export const scholarshipById = Object.fromEntries(scholarships.map(s => [s.id, s]));

/** Countries that actually have a university in the dataset, with counts. */
export const activeCountries = (() => {
  const counts = {};
  universities.forEach(u => { counts[u.country] = (counts[u.country] || 0) + 1; });
  return countries
    .filter(c => counts[c.code])
    .map(c => ({ ...c, count: counts[c.code] }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export const regions = [...new Set(universities.map(u => u.region))].sort();

/** Field list with how many universities offer each. */
export const activeFields = fields.map(f => ({
  ...f,
  count: universities.filter(u => u.fields.includes(f.id)).length
}));

export const languages = [...new Set(universities.flatMap(u => u.language))].sort();

/** Cheapest / most expensive, for slider bounds. */
export const costRange = {
  min: 0,
  max: Math.ceil(Math.max(...universities.map(u => u.totalCostUSD)) / 5000) * 5000
};

export function scholarshipsForUniversity(id) {
  const uni = universityById[id];
  if (!uni) return [];
  const direct = (uni.scholarships || []).map(sid => scholarshipById[sid]).filter(Boolean);
  const byCountry = scholarships.filter(s =>
    s.scope === 'country' && s.country === uni.country && !direct.includes(s));
  const global = scholarships.filter(s => s.scope === 'global' && !direct.includes(s));
  return [...direct, ...byCountry, ...global];
}

/** Universities strong in a given field, best-ranked first. */
export function universitiesForField(fieldId, limit = null) {
  const list = universities.filter(u => u.fields.includes(fieldId));
  list.sort((a, b) => {
    const aStrong = a.strongFields?.includes(fieldId) ? 0 : 1;
    const bStrong = b.strongFields?.includes(fieldId) ? 0 : 1;
    return aStrong - bStrong || a.rankGlobal - b.rankGlobal;
  });
  return limit ? list.slice(0, limit) : list;
}
