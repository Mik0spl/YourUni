import { initChrome, initReveal, toast } from '../lib/ui.js';
import { universities, activeFields, activeCountries, costRange, fieldById, countryByCode } from '../lib/data.js';
import { universityCard, bindCardActions } from '../lib/cards.js';
import { getProfile, hasGrades } from '../lib/profile.js';
import { assess } from '../lib/chances.js';
import { money, number, percent, esc } from '../lib/format.js';

initChrome({ current: 'explore.html' });

const profile = getProfile();
const personalised = hasGrades(profile);

/** Chance results are cached — assessing 116 universities on every keystroke is wasteful. */
const chanceCache = new Map();
function chanceFor(uni) {
  if (!personalised) return null;
  if (!chanceCache.has(uni.id)) chanceCache.set(uni.id, assess(uni, profile));
  return chanceCache.get(uni.id);
}

const DEFAULTS = {
  q: '', fields: [], countries: [],
  maxCost: costRange.max, minAcceptance: 0, maxRank: 600, minQol: 0,
  freeTuition: false, english: false, public: false, inRange: false,
  sort: personalised ? 'chance' : 'rank'
};

const state = { ...DEFAULTS };

// ------------------------------------------------------- read the URL first
(function readURL() {
  const p = new URLSearchParams(location.search);
  if (p.get('q')) state.q = p.get('q');
  if (p.get('field')) state.fields = p.get('field').split(',').filter(f => fieldById[f]);
  if (p.get('country')) state.countries = p.get('country').split(',').filter(c => countryByCode[c]);
  if (p.get('maxCost')) state.maxCost = Number(p.get('maxCost'));
  if (p.get('sort')) state.sort = p.get('sort');
  if (p.get('freeTuition')) state.freeTuition = true;
  if (p.get('english')) state.english = true;
})();

function writeURL() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.fields.length) p.set('field', state.fields.join(','));
  if (state.countries.length) p.set('country', state.countries.join(','));
  if (state.maxCost < costRange.max) p.set('maxCost', String(state.maxCost));
  if (state.sort !== DEFAULTS.sort) p.set('sort', state.sort);
  if (state.freeTuition) p.set('freeTuition', '1');
  if (state.english) p.set('english', '1');
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

// ------------------------------------------------------------------ filter
function filtered() {
  const q = state.q.trim().toLowerCase();
  let list = universities.filter(u => {
    if (q && !u.searchText.includes(q)) return false;
    if (state.fields.length && !state.fields.some(f => u.fields.includes(f))) return false;
    if (state.countries.length && !state.countries.includes(u.country)) return false;
    if (u.totalCostUSD > state.maxCost) return false;
    if (state.freeTuition && u.tuition.intl > 0) return false;
    if (u.acceptance * 100 < state.minAcceptance) return false;
    if (u.rankGlobal > state.maxRank) return false;
    if (u.qolScore < state.minQol) return false;
    if (state.english && !u.language.includes('English')) return false;
    if (state.public && u.type !== 'public') return false;
    if (state.inRange) {
      const c = chanceFor(u);
      if (!c || c.probability < 0.12) return false;
    }
    return true;
  });

  const sorters = {
    rank: (a, b) => a.rankGlobal - b.rankGlobal,
    cost: (a, b) => a.totalCostUSD - b.totalCostUSD,
    acceptance: (a, b) => b.acceptance - a.acceptance,
    qol: (a, b) => b.qolScore - a.qolScore,
    intl: (a, b) => b.intlShare - a.intlShare,
    chance: (a, b) => (chanceFor(b)?.probability ?? 0) - (chanceFor(a)?.probability ?? 0)
  };
  list.sort(sorters[state.sort] || sorters.rank);
  return list;
}

// ------------------------------------------------------------------ render
const resultsEl = document.querySelector('[data-results]');
const emptyEl = document.querySelector('[data-empty]');
const countEl = document.querySelector('[data-count]');

function activeFilterCount() {
  let n = 0;
  if (state.q) n++;
  n += state.fields.length + state.countries.length;
  if (state.maxCost < costRange.max) n++;
  if (state.minAcceptance > 0) n++;
  if (state.maxRank < 600) n++;
  if (state.minQol > 0) n++;
  ['freeTuition', 'english', 'public', 'inRange'].forEach(k => { if (state[k]) n++; });
  return n;
}

function renderActiveFilters() {
  const chips = [];
  const chip = (label, clear) =>
    `<button class="chip chip-btn" type="button" data-clear='${JSON.stringify(clear)}'>
       ${esc(label)} <span aria-hidden="true">×</span><span class="visually-hidden">Remove filter</span></button>`;

  if (state.q) chips.push(chip(`“${state.q}”`, { key: 'q' }));
  state.fields.forEach(f => chips.push(chip(fieldById[f].name, { key: 'fields', value: f })));
  state.countries.forEach(c => chips.push(chip(countryByCode[c].name, { key: 'countries', value: c })));
  if (state.maxCost < costRange.max) chips.push(chip(`Under ${money(state.maxCost, 'USD', { compact: true })}/yr`, { key: 'maxCost' }));
  if (state.minAcceptance > 0) chips.push(chip(`Accepts ${state.minAcceptance}%+`, { key: 'minAcceptance' }));
  if (state.maxRank < 600) chips.push(chip(`Top ${state.maxRank}`, { key: 'maxRank' }));
  if (state.minQol > 0) chips.push(chip(`Quality of life ${state.minQol}+`, { key: 'minQol' }));
  if (state.freeTuition) chips.push(chip('Tuition-free', { key: 'freeTuition' }));
  if (state.english) chips.push(chip('English-taught', { key: 'english' }));
  if (state.public) chips.push(chip('Public only', { key: 'public' }));
  if (state.inRange) chips.push(chip("Where I'm competitive", { key: 'inRange' }));

  const host = document.querySelector('[data-active-filters]');
  host.innerHTML = chips.length
    ? chips.join('') + `<button class="chip chip-btn" type="button" data-reset>Clear all</button>`
    : '';
}

function render() {
  const list = filtered();

  countEl.textContent = list.length === universities.length
    ? `${number(list.length)} universities`
    : `${number(list.length)} of ${number(universities.length)} universities`;

  resultsEl.innerHTML = list.map(u => universityCard(u, chanceFor(u))).join('');
  emptyEl.hidden = list.length > 0;
  if (!list.length) {
    emptyEl.innerHTML = `
      <div class="empty">
        <div class="empty__glyph" aria-hidden="true">🔍</div>
        <h3>Nothing matches all of those filters</h3>
        <p class="muted">Try widening the cost range or removing a country.</p>
        <button class="btn btn--secondary btn--sm" type="button" data-reset style="margin-top:1rem">Clear all filters</button>
      </div>`;
  }

  const badge = document.querySelector('[data-filter-count]');
  const n = activeFilterCount();
  badge.textContent = n || '';
  badge.hidden = !n;

  renderActiveFilters();
  writeURL();
  initReveal(resultsEl);
}

// ------------------------------------------------------------------ inputs
document.querySelector('[data-field-filters]').innerHTML = activeFields.map(f => `
  <label class="checkbox-row">
    <input type="checkbox" data-multi="fields" value="${f.id}">
    <span>${f.icon} ${esc(f.name)}</span>
    <span class="checkbox-row__count">${f.count}</span>
  </label>`).join('');

document.querySelector('[data-country-filters]').innerHTML = activeCountries.map(c => `
  <label class="checkbox-row">
    <input type="checkbox" data-multi="countries" value="${c.code}">
    <span>${c.flag} ${esc(c.name)}</span>
    <span class="checkbox-row__count">${c.count}</span>
  </label>`).join('');

const maxCostInput = document.querySelector('[data-filter="maxCost"]');
maxCostInput.max = String(costRange.max);
const maxRankInput = document.querySelector('[data-filter="maxRank"]');

function syncInputs() {
  document.querySelector('[data-filter="q"]').value = state.q;
  maxCostInput.value = state.maxCost;
  document.querySelector('[data-filter="minAcceptance"]').value = state.minAcceptance;
  maxRankInput.value = state.maxRank;
  document.querySelector('[data-filter="minQol"]').value = state.minQol;
  ['freeTuition', 'english', 'public', 'inRange'].forEach(k => {
    const el = document.querySelector(`[data-filter="${k}"]`);
    if (el) el.checked = state[k];
  });
  document.querySelectorAll('[data-multi]').forEach(el => {
    el.checked = state[el.dataset.multi].includes(el.value);
  });
  document.querySelector('[data-sort]').value = state.sort;

  document.querySelector('[data-cost-label]').textContent =
    state.maxCost >= costRange.max ? 'No limit' : `Up to ${money(state.maxCost, 'USD')}`;
  document.querySelector('[data-acceptance-label]').textContent =
    state.minAcceptance === 0 ? 'Any selectivity' : `Only universities accepting ${state.minAcceptance}% or more`;
  document.querySelector('[data-rank-label]').textContent =
    state.maxRank >= 600 ? 'Any ranking' : `World top ${state.maxRank}`;
  document.querySelector('[data-qol-label]').textContent =
    state.minQol === 0 ? 'Any' : `${state.minQol} out of 100 or better`;

  // Paint the filled portion of each slider track.
  document.querySelectorAll('.range').forEach(r => {
    const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
    r.style.setProperty('--fill', `${pct}%`);
  });
}

let debounce;
document.querySelector('#filters').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.multi) {
    const key = el.dataset.multi;
    state[key] = el.checked ? [...state[key], el.value] : state[key].filter(v => v !== el.value);
  } else if (el.dataset.filter) {
    const key = el.dataset.filter;
    state[key] = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value);
  } else return;

  syncInputs();
  clearTimeout(debounce);
  debounce = setTimeout(render, el.type === 'range' || el.type === 'search' ? 140 : 0);
});

document.querySelector('[data-sort]').addEventListener('change', e => {
  state.sort = e.target.value;
  render();
});

document.addEventListener('click', e => {
  const clear = e.target.closest('[data-clear]');
  if (clear) {
    const { key, value } = JSON.parse(clear.dataset.clear);
    state[key] = value ? state[key].filter(v => v !== value) : DEFAULTS[key];
    syncInputs(); render(); return;
  }
  if (e.target.closest('[data-reset]')) {
    Object.assign(state, { ...DEFAULTS, sort: state.sort });
    syncInputs(); render();
    toast('Filters cleared');
    return;
  }
  const accordion = e.target.closest('[data-accordion]');
  if (accordion) {
    const open = accordion.getAttribute('aria-expanded') === 'true';
    accordion.setAttribute('aria-expanded', String(!open));
  }
});

// ------------------------------------------------------- mobile filter drawer
const filtersEl = document.getElementById('filters');
document.querySelector('[data-open-filters]').addEventListener('click', () => {
  filtersEl.classList.add('is-open');
  document.body.style.overflow = 'hidden';
});
document.querySelector('[data-close-filters]').addEventListener('click', () => {
  filtersEl.classList.remove('is-open');
  document.body.style.overflow = '';
});

// --------------------------------------------------------------- personalise
if (personalised) {
  document.querySelector('[data-profile-filter]').hidden = false;
} else {
  document.querySelector('[data-sort] option[value="chance"]').disabled = true;
  document.querySelector('[data-subtitle]').innerHTML =
    `Filter by what actually decides your decision — cost, subject, entry requirements and acceptance rate.
     <a href="profile.html">Add your grades</a> to see your chances on each card.`;
}

// Title reflects a single-field or single-country view arriving from a link.
if (state.fields.length === 1 && !state.countries.length) {
  document.querySelector('[data-title]').textContent = `${fieldById[state.fields[0]].name} universities`;
} else if (state.countries.length === 1 && !state.fields.length) {
  document.querySelector('[data-title]').textContent = `Universities in ${countryByCode[state.countries[0]].name}`;
}

bindCardActions(resultsEl);
syncInputs();
render();
