/**
 * The student profile, stored in the browser only.
 *
 * No account, no server, no cookie sent anywhere — this is localStorage on the
 * visitor's own device. Clearing site data removes it completely.
 */
const KEY = 'youruni.profile.v1';
const listeners = new Set();

const EMPTY = {
  gradeSystem: '', grade: '',
  tests: { sat: '', act: '' },
  english: { test: 'ielts', score: '', native: false },
  activities: [],
  fields: [],
  countries: [],
  budget: 0,          // total per year in USD; 0 means no limit
  citizenship: '',
  needsAid: false,
  shortlist: [],
  compare: [],
  updatedAt: null
};

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...structuredClone(EMPTY), ...JSON.parse(raw) } : structuredClone(EMPTY);
  } catch {
    cache = structuredClone(EMPTY);
  }
  // Guard against a partially-shaped object from an older version.
  cache.tests = { ...EMPTY.tests, ...(cache.tests || {}) };
  cache.english = { ...EMPTY.english, ...(cache.english || {}) };
  for (const k of ['activities', 'fields', 'countries', 'shortlist', 'compare']) {
    if (!Array.isArray(cache[k])) cache[k] = [];
  }
  return cache;
}

function write(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private browsing or storage full — the session still works, it just won't persist */
  }
  listeners.forEach(fn => fn(next));
}

export function getProfile() {
  return read();
}

export function updateProfile(patch) {
  const next = { ...read(), ...patch, updatedAt: Date.now() };
  write(next);
  return next;
}

export function clearProfile() {
  write(structuredClone(EMPTY));
}

export function onProfileChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True once there's enough here to compute admission chances. */
export function hasGrades(p = read()) {
  return Boolean(p.gradeSystem && p.grade !== '' && p.grade != null);
}

export function isComplete(p = read()) {
  return hasGrades(p) && p.fields.length > 0;
}

/** How much of the profile is filled in, as a 0–1 fraction. */
export function completeness(p = read()) {
  const checks = [
    hasGrades(p),
    p.fields.length > 0,
    p.citizenship !== '',
    p.english.native || p.english.score !== '',
    p.activities.length > 0,
    p.budget > 0,
    p.countries.length > 0
  ];
  return checks.filter(Boolean).length / checks.length;
}

// ---------------------------------------------------------------- shortlist
export function toggleShortlist(id) {
  const p = read();
  const list = p.shortlist.includes(id) ? p.shortlist.filter(x => x !== id) : [...p.shortlist, id];
  updateProfile({ shortlist: list });
  return list.includes(id);
}

export function inShortlist(id, p = read()) {
  return p.shortlist.includes(id);
}

// ------------------------------------------------------------------ compare
export const COMPARE_LIMIT = 4;

export function toggleCompare(id) {
  const p = read();
  if (p.compare.includes(id)) {
    updateProfile({ compare: p.compare.filter(x => x !== id) });
    return { active: false, full: false };
  }
  if (p.compare.length >= COMPARE_LIMIT) return { active: false, full: true };
  updateProfile({ compare: [...p.compare, id] });
  return { active: true, full: false };
}

export function inCompare(id, p = read()) {
  return p.compare.includes(id);
}
