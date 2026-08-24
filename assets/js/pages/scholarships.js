import { initChrome, initReveal, toast, icon } from '../lib/ui.js';
import { scholarships, universityById, countryByCode, fieldById, countries } from '../lib/data.js';
import { getProfile, hasGrades } from '../lib/profile.js';
import { toIndex } from '../lib/grades.js';
import { money, number, esc } from '../lib/format.js';

initChrome({ current: 'scholarships.html' });

const profile = getProfile();
const studentIndex = hasGrades(profile) ? toIndex(profile.gradeSystem, profile.grade) : null;

const EU_EEA = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO']);

/** Rough grouping used by programmes that target lower- and middle-income countries. */
const DEVELOPING = new Set(['IN','BR','MX','ZA','TR','CN','ID','PH','VN','TH','EG','NG','KE','GH',
  'PK','BD','LK','NP','UA','GE','AM','AZ','MD','RS','BA','MK','AL','PE','CO','AR','CL','EC','BO']);

/**
 * Why a student can or cannot apply. Returns a status plus the human reason,
 * because "not eligible" without a reason is useless to someone planning.
 */
function eligibilityFor(s) {
  if (!studentIndex) return null;
  const reasons = [];
  let status = 'good';

  if (s.eligibility.minIndex != null && studentIndex < s.eligibility.minIndex - 3) {
    status = 'critical';
    reasons.push('Your grades are below the academic bar for this award');
  } else if (s.eligibility.minIndex != null && studentIndex < s.eligibility.minIndex) {
    status = status === 'good' ? 'warning' : status;
    reasons.push('You are just under the usual academic bar — borderline');
  }

  const c = s.eligibility.citizenship;
  const mine = profile.citizenship;
  if (mine && c && c !== 'any') {
    if (c === 'non-eu' && EU_EEA.has(mine)) {
      status = 'critical'; reasons.push('Only for students from outside the EU/EEA');
    } else if (c === 'eu' && !EU_EEA.has(mine)) {
      status = 'critical'; reasons.push('Only for EU/EEA citizens');
    } else if (c === 'developing' && !DEVELOPING.has(mine)) {
      status = 'critical'; reasons.push('Restricted to a defined list of partner countries');
    } else if (Array.isArray(c) && !c.includes(mine)) {
      status = 'critical';
      reasons.push(`Only for citizens of ${c.map(x => countryByCode[x]?.name ?? x).join(', ')}`);
    }
  }

  if (s.eligibility.fields && profile.fields.length &&
      !s.eligibility.fields.some(f => profile.fields.includes(f))) {
    status = 'critical';
    reasons.push(`Restricted to ${s.eligibility.fields.map(f => fieldById[f]?.name ?? f).join(', ')}`);
  }

  if (s.eligibility.level && s.eligibility.level !== 'bachelor') {
    if (status === 'good') status = 'warning';
    reasons.push(`Applies at ${s.eligibility.level} level, not undergraduate`);
  }

  return {
    status,
    label: status === 'good' ? 'You qualify' : status === 'warning' ? 'Check the detail' : 'Not eligible',
    reasons
  };
}

const DEFAULTS = { q: '', coverage: [], type: [], level: [], countries: [], eligible: false };
const state = { ...DEFAULTS };

let restrictedTo = null;
(function readURL() {
  const p = new URLSearchParams(location.search);
  if (p.get('q')) state.q = p.get('q');
  if (p.get('country')) state.countries = p.get('country').split(',');
  if (p.get('university')) restrictedTo = p.get('university');
})();

// Countries that actually award something here.
const scholarshipCountries = (() => {
  const counts = {};
  scholarships.forEach(s => { if (s.country) counts[s.country] = (counts[s.country] || 0) + 1; });
  return countries.filter(c => counts[c.code])
    .map(c => ({ ...c, count: counts[c.code] }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

document.querySelector('[data-country-filters]').innerHTML = scholarshipCountries.map(c => `
  <label class="checkbox-row">
    <input type="checkbox" data-multi="countries" value="${c.code}">
    <span>${c.flag} ${esc(c.name)}</span>
    <span class="checkbox-row__count">${c.count}</span>
  </label>`).join('');

if (studentIndex != null) {
  document.querySelector('[data-eligible-group]').hidden = false;
  document.querySelector('[data-eligible-hint]').textContent =
    `Checked against your grades${profile.citizenship ? ` and ${countryByCode[profile.citizenship]?.name ?? ''} citizenship` : ''}.`;
}

if (restrictedTo && universityById[restrictedTo]) {
  document.querySelector('[data-title]').textContent =
    `Scholarships at ${universityById[restrictedTo].short}`;
}

function pool() {
  if (!restrictedTo) return scholarships;
  const uni = universityById[restrictedTo];
  if (!uni) return scholarships;
  return scholarships.filter(s =>
    (uni.scholarships || []).includes(s.id) ||
    (s.scope === 'country' && s.country === uni.country) ||
    s.scope === 'global');
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  return pool().filter(s => {
    if (q && !`${s.name} ${s.provider} ${s.note ?? ''}`.toLowerCase().includes(q)) return false;
    if (state.coverage.length && !state.coverage.includes(s.coverage)) return false;
    if (state.type.length && !state.type.includes(s.type)) return false;
    if (state.level.length && !state.level.includes(s.eligibility.level)) return false;
    if (state.countries.length && !state.countries.includes(s.country)) return false;
    if (state.eligible) {
      const e = eligibilityFor(s);
      if (!e || e.status === 'critical') return false;
    }
    return true;
  });
}

function card(s) {
  const e = eligibilityFor(s);
  const amount = s.amount.text ?? `${money(s.amount.value, s.amount.currency)} / ${s.amount.period}`;
  const scopeLabel = s.scope === 'global' ? 'Open worldwide'
    : s.scope === 'country' ? `${countryByCode[s.country]?.flag ?? ''} ${countryByCode[s.country]?.name ?? s.country}`
    : (s.universities || []).map(id => universityById[id]?.short).filter(Boolean).join(', ');

  return `
    <article class="scholarship-card reveal">
      <div class="scholarship-card__head">
        <div>
          <h3 class="scholarship-card__name">${esc(s.name)}</h3>
          <p class="scholarship-card__provider">${esc(s.provider)} · ${esc(scopeLabel)}</p>
        </div>
        <div class="scholarship-card__amount">
          ${s.coverage === 'full' ? 'Full' : 'Partial'}
          <small>${esc(String(s.type).replace(/-/g, ' '))}</small>
        </div>
      </div>

      <p class="small" style="color:var(--ink-2)">${esc(amount)}</p>

      <div class="uni-card__tags">
        ${e ? `<span class="chip chip--${e.status}">${esc(e.label)}</span>` : ''}
        <span class="chip chip--outline">${esc(levelLabel(s.eligibility.level))}</span>
        ${s.eligibility.needBased ? '<span class="chip chip--outline">Income assessed</span>' : ''}
        ${s.renewable ? '<span class="chip chip--outline">Renewable</span>' : '<span class="chip chip--outline">One-off</span>'}
        ${s.eligibility.minIndex ? `<span class="chip chip--outline"
           data-tip="On the 0–100 academic index this site uses${studentIndex ? `. Yours is ${studentIndex.toFixed(0)}` : ''}">
           Academic bar ${s.eligibility.minIndex}</span>` : ''}
      </div>

      ${e && e.reasons.length ? `
        <ul class="small" style="color:var(--ink-3);padding-left:1.1rem;margin:0">
          ${e.reasons.map(r => `<li>${esc(r)}</li>`).join('')}
        </ul>` : ''}

      ${s.note ? `<p class="small muted">${esc(s.note)}</p>` : ''}

      <div class="row row--between" style="border-top:1px solid var(--hairline);padding-top:.7rem">
        <span class="small dim">Deadline: ${esc(s.deadline ?? 'Varies')}</span>
        ${s.link ? `<a class="btn btn--ghost btn--sm" href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">
          Official page ${icon('arrow')}</a>` : ''}
      </div>
    </article>`;
}

function levelLabel(level) {
  return { bachelor: "Bachelor's", master: "Master's", postgraduate: 'Postgraduate' }[level] || level || 'Any level';
}

function render() {
  const list = filtered();
  // Best first: full rides you qualify for, then everything else.
  const rank = s => {
    const e = eligibilityFor(s);
    const eligibility = !e ? 1 : { good: 0, warning: 1, critical: 2 }[e.status];
    return eligibility * 10 + (s.coverage === 'full' ? 0 : 1);
  };
  list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

  document.querySelector('[data-count]').textContent =
    `${number(list.length)} of ${number(pool().length)} scholarships`;
  document.querySelector('[data-results]').innerHTML = list.map(card).join('');

  const emptyEl = document.querySelector('[data-empty]');
  emptyEl.hidden = list.length > 0;
  if (!list.length) {
    emptyEl.innerHTML = `<div class="empty"><div class="empty__glyph">🎓</div>
      <h3>No scholarships match those filters</h3>
      <p class="muted">Try clearing the eligibility toggle — many awards are worth reading even
      if you are borderline.</p>
      <button class="btn btn--secondary btn--sm" type="button" data-reset style="margin-top:1rem">Clear filters</button></div>`;
  }
  initReveal(document.querySelector('[data-results]'));
}

function syncInputs() {
  document.querySelector('[data-filter="q"]').value = state.q;
  const el = document.querySelector('[data-filter="eligible"]');
  if (el) el.checked = state.eligible;
  document.querySelectorAll('[data-multi]').forEach(i => {
    i.checked = state[i.dataset.multi].includes(i.value);
  });
}

document.querySelector('#filters').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.multi) {
    const key = el.dataset.multi;
    state[key] = el.checked ? [...state[key], el.value] : state[key].filter(v => v !== el.value);
  } else if (el.dataset.filter) {
    state[el.dataset.filter] = el.type === 'checkbox' ? el.checked : el.value;
  } else return;
  render();
});

document.addEventListener('click', e => {
  if (e.target.closest('[data-reset]')) {
    Object.assign(state, DEFAULTS);
    syncInputs(); render(); toast('Filters cleared');
  }
});

const filtersEl = document.getElementById('filters');
document.querySelector('[data-open-filters]').addEventListener('click', () => {
  filtersEl.classList.add('is-open'); document.body.style.overflow = 'hidden';
});
document.querySelector('[data-close-filters]').addEventListener('click', () => {
  filtersEl.classList.remove('is-open'); document.body.style.overflow = '';
});

syncInputs();
render();
