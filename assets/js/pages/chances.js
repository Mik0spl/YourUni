import { initChrome, initReveal, icon } from '../lib/ui.js';
import { universities, fieldById, countryByCode, activities, activityCategories } from '../lib/data.js';
import { universityCard, bindCardActions } from '../lib/cards.js';
import { getProfile, hasGrades } from '../lib/profile.js';
import { assessAll, assess, improvements, activityScore, BANDS } from '../lib/chances.js';
import { formatGrade, toIndex } from '../lib/grades.js';
import { money, number, percent, esc } from '../lib/format.js';
import { stat, meter } from '../lib/charts.js';

initChrome({ current: 'chances.html' });

const profile = getProfile();

if (!hasGrades(profile)) {
  const empty = document.querySelector('[data-empty-state]');
  empty.hidden = false;
  empty.innerHTML = `
    <div class="empty" style="padding-block:5rem">
      <div class="empty__glyph" aria-hidden="true">🎯</div>
      <h3>We need your grades first</h3>
      <p class="muted" style="max-width:46ch;margin-inline:auto">
        Tell us your grading system and your result, and every university on the site gets an
        honest estimate — plus a list of what would improve it.
      </p>
      <a class="btn btn--primary" href="profile.html" style="margin-top:1.4rem">Add your grades</a>
    </div>`;
} else {
  document.querySelector('[data-content]').hidden = false;
  const initialScope = profile.fields.length ? 'fields' : 'all';
  document.querySelector('[data-scope]').value = initialScope;
  render(initialScope);
}

function scopedUniversities(scope) {
  switch (scope) {
    case 'fields':
      return profile.fields.length
        ? universities.filter(u => profile.fields.some(f => u.fields.includes(f))) : universities;
    case 'countries':
      return profile.countries.length
        ? universities.filter(u => profile.countries.includes(u.country)) : universities;
    case 'budget':
      return profile.budget > 0
        ? universities.filter(u => u.totalCostUSD <= profile.budget) : universities;
    case 'shortlist':
      return universities.filter(u => profile.shortlist.includes(u.id));
    default:
      return universities;
  }
}

function render(scope = 'all') {
  const pool = scopedUniversities(scope);
  const buckets = assessAll(pool, profile);

  // ------------------------------------------------------------ profile line
  const subjects = profile.fields.map(f => fieldById[f]?.name).filter(Boolean);
  document.querySelector('[data-profile-line]').innerHTML = [
    `<b>${esc(formatGrade(profile.gradeSystem, profile.grade))}</b>`,
    subjects.length ? `aiming at ${esc(subjects.join(', '))}` : 'no subject chosen yet',
    profile.budget > 0 ? `budget ${money(profile.budget, 'USD')} a year` : null
  ].filter(Boolean).join(' · ');

  // --------------------------------------------------------------- overview
  document.querySelector('[data-overview]').innerHTML = [
    stat('Likely', number(buckets.likely.length), '60% or better'),
    stat('Target', number(buckets.target.length), '30–60%'),
    stat('Reach', number(buckets.reach.length), '12–30%'),
    stat('Far reach', number(buckets.farReach.length), 'Under 12%'),
    stat('Academic index', (toIndex(profile.gradeSystem, profile.grade) ?? 0).toFixed(0), 'Out of 100'),
    stat('Activity score', (activityScore(profile) * 100).toFixed(0), 'Out of 100')
  ].join('');

  // ------------------------------------------------------ balance guidance
  renderBalance(buckets);

  // ---------------------------------------------------------------- buckets
  const host = document.querySelector('[data-buckets]');
  const byRank = list => [...list].sort((a, b) => a.uni.rankGlobal - b.uni.rankGlobal);
  const order = [
    ['likely', byRank(buckets.likely), 'Apply to two or three of these. They are what makes the rest of your list safe to attempt.'],
    ['target', byRank(buckets.target), 'The heart of a good application list — realistic, but not guaranteed. Put most of your effort here.'],
    ['reach', byRank(buckets.reach), 'Worth applying to if the university genuinely fits what you want. Expect rejection more often than not.'],
    ['far-reach', byRank(buckets.farReach), 'Long shots. One or two is ambition; five is a plan that ends badly.']
  ];

  host.innerHTML = order.map(([id, list, advice]) => {
    if (!list.length) return '';
    const band = BANDS[id];
    const shown = list.slice(0, 9);
    return `
      <section class="bucket">
        <div class="bucket__head">
          <span class="bucket__dot" style="background:var(--status-${band.status})"></span>
          <span class="bucket__title">${esc(band.label)}</span>
          <span class="chip">${number(list.length)}</span>
          <p class="bucket__desc">${esc(advice)}</p>
        </div>
        <div class="grid grid--3">
          ${shown.map(r => universityCard(r.uni, r.result)).join('')}
        </div>
        ${list.length > shown.length ? `
          <div class="center" style="margin-top:var(--sp-4)">
            <button class="btn btn--secondary btn--sm" type="button" data-more="${id}">
              Show all ${number(list.length)} ${esc(band.label.toLowerCase())} universities</button>
          </div>` : ''}
      </section>`;
  }).join('') || `<div class="empty"><div class="empty__glyph">🔍</div>
      <h3>Nothing in this view</h3><p class="muted">Try widening the filter above.</p></div>`;

  host.querySelectorAll('[data-more]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.more;
      const list = byRank({ likely: buckets.likely, target: buckets.target,
                            reach: buckets.reach, 'far-reach': buckets.farReach }[id]);
      const grid = btn.closest('.bucket').querySelector('.grid');
      grid.innerHTML = list.map(r => universityCard(r.uni, r.result)).join('');
      btn.remove();
      initReveal(grid);
    });
  });

  // ---------------------------------------------------------------- levers
  renderLevers(buckets);
  renderCulture();
  renderActivityGuide();

  bindCardActions(host);
  initReveal();
}

// -------------------------------------------------------------- balance
function renderBalance(buckets) {
  const total = buckets.all.length;
  // How many options you want available in each band to build a list from.
  const ideal = { likely: 3, target: 5, reach: 4 };
  const CAP = 10;
  const have = { likely: buckets.likely.length, target: buckets.target.length, reach: buckets.reach.length };

  let verdict, status;
  if (!have.likely) {
    verdict = 'You have no likely options at all. A list without a genuine safety is the single most common way strong applicants end up with nowhere to go.';
    status = 'critical';
  } else if (!have.target) {
    verdict = 'Almost everything here is either safe or a long shot. The middle of the list is where offers usually come from.';
    status = 'serious';
  } else if (have.target < 3) {
    verdict = 'Your target band is thin. Widening your subject or country filters usually turns up more realistic matches.';
    status = 'warning';
  } else {
    verdict = 'You have a workable spread. Aim for roughly three likely, four target and two reach applications.';
    status = 'good';
  }

  document.querySelector('[data-balance]').innerHTML = `
    <div class="card__head">
      <span class="card__title">Is your list balanced?</span>
      <span class="chip chip--${status}">${status === 'good' ? 'Looks healthy' : 'Needs attention'}</span>
    </div>
    <p class="muted" style="font-size:.92rem">${esc(verdict)}</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--sp-4);margin-top:var(--sp-4)">
      ${Object.entries(ideal).map(([key, want]) => `
        <div>
          ${meter(Math.min(have[key], CAP), { max: CAP,
            status: have[key] >= want ? 'good' : have[key] > 0 ? 'warning' : 'critical',
            label: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
            leftLabel: `${number(have[key])} option${have[key] === 1 ? '' : 's'} available`,
            rightLabel: have[key] >= want ? 'Enough to choose from' : `Want about ${want}` })}
        </div>`).join('')}
    </div>
    <p class="small dim" style="margin-top:var(--sp-3)">
      Options available across ${number(total)} universities in this view — not the number of
      applications to send. A typical list is about three likely, four target and two reach.
    </p>`;
}

// --------------------------------------------------------------- levers
function renderLevers(buckets) {
  // Average each lever's effect across the universities the student realistically wants.
  const focus = [...buckets.target, ...buckets.reach].slice(0, 25);
  const pool = focus.length ? focus : buckets.all.slice(0, 25);

  const totals = new Map();
  pool.forEach(({ uni }) => {
    improvements(uni, profile).forEach(imp => {
      const entry = totals.get(imp.id) || { label: imp.label, description: imp.description, sum: 0, count: 0 };
      entry.sum += imp.delta;
      entry.count += 1;
      // Prefer a generic label when the same lever is phrased per-university.
      totals.set(imp.id, entry);
    });
  });

  const levers = [...totals.entries()]
    .map(([id, e]) => ({ id, label: e.label, description: e.description, avg: e.sum / pool.length, applies: e.count }))
    .sort((a, b) => b.avg - a.avg);

  const host = document.querySelector('[data-levers]');
  if (!levers.length) {
    host.innerHTML = `<div class="card"><p class="muted">
      Your profile is already strong across this list — the remaining variation is down to
      essays, references and fit rather than anything measurable here.</p></div>`;
    return;
  }

  host.innerHTML = levers.map((l, i) => `
    <div class="card reveal">
      <div class="card__head">
        <span class="card__title">${esc(genericLabel(l.id, l.label))}</span>
        <span class="factor__delta" style="font-size:1.05rem">+${(l.avg * 100).toFixed(1)}pp</span>
      </div>
      <p class="small muted">${esc(l.description)}</p>
      <p class="small dim" style="margin-top:.6rem">
        Average gain across ${number(pool.length)} universities you are aiming at${
          l.applies < pool.length ? `, and it applies at ${number(l.applies)} of them` : ''}.
      </p>
      ${i === 0 ? '<span class="chip chip--brand" style="margin-top:.7rem">Biggest single lever</span>' : ''}
    </div>`).join('');
}

function genericLabel(id, fallback) {
  return {
    grades: 'Raise your predicted grades one band',
    english: 'Reach the English score they ask for',
    sat: 'Raise your SAT to their typical range',
    olympiad: 'Reach a national subject olympiad final',
    research: 'Take on a research placement',
    leadership: 'Build something that outlasts you'
  }[id] || fallback;
}

// -------------------------------------------------------------- culture
function renderCulture() {
  const targetCountries = profile.countries.length
    ? profile.countries
    : [...new Set(universities.slice(0, 40).map(u => u.country))];

  const rows = targetCountries
    .map(code => {
      const uni = universities.find(u => u.country === code);
      return uni ? { code, name: countryByCode[code].name, flag: countryByCode[code].flag, culture: uni.culture } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.culture.weight - a.culture.weight)
    .slice(0, 8);

  document.querySelector('[data-culture]').innerHTML = `
    <div class="card__head">
      <span class="card__title">How much your activities count, by country</span>
    </div>
    <p class="small muted" style="margin-bottom:var(--sp-4)">
      The same extracurricular record is worth very different amounts depending on where you apply.
      This is why "build a well-rounded profile" is bad advice unless someone tells you where.
    </p>
    <div class="score-bars">
      ${rows.map(r => `
        <div class="score-bar" data-tip="<b>${esc(r.name)} — ${esc(r.culture.label)}</b><br>${esc(r.culture.note)}">
          <span class="score-bar__label">${r.flag} ${esc(r.name)}</span>
          <div class="score-bar__track">
            <div class="score-bar__fill" style="width:${r.culture.weight * 100}%"></div>
          </div>
          <span class="score-bar__value tnum">${Math.round(r.culture.weight * 100)}</span>
        </div>`).join('')}
    </div>
    <p class="small dim" style="margin-top:var(--sp-4)">
      100 means the whole application is read. 10 means your grade decides it and little else does.
    </p>`;
}

// ------------------------------------------------------- activity guidance
function renderActivityGuide() {
  const have = new Set(profile.activities);
  const wanted = profile.fields;

  const ranked = activities
    .map(a => {
      const relevant = a.bestFor !== 'all' && a.bestFor.some(f => wanted.includes(f));
      return { ...a, weighted: a.impact * (relevant ? 1.25 : 1), relevant };
    })
    .sort((a, b) => b.weighted - a.weighted);

  document.querySelector('[data-activity-guide]').innerHTML = activityCategories.map(cat => {
    const items = ranked.filter(a => a.category === cat.id);
    if (!items.length) return '';
    return `
      <div class="card reveal">
        <div class="card__head"><span class="card__title">${cat.icon} ${esc(cat.name)}</span></div>
        <div class="stack-sm">
          ${items.map(a => `
            <div class="factor">
              <span class="factor__name">
                ${esc(a.name)}
                ${have.has(a.id) ? '<span class="chip chip--good" style="margin-left:.4rem">You have this</span>' : ''}
                ${a.relevant ? '<span class="chip chip--brand" style="margin-left:.4rem">Counts extra for your subject</span>' : ''}
              </span>
              <span class="factor__delta" style="color:var(--ink-2)">${a.impact.toFixed(1)}<span class="dim" style="font-weight:500">/10</span></span>
              <span class="factor__desc">${esc(a.description)}<br>
                <b style="color:var(--ink-2)">Evidence:</b> ${esc(a.evidence)} ·
                <b style="color:var(--ink-2)">Effort:</b> ${esc(a.effort)} ·
                <b style="color:var(--ink-2)">Timeline:</b> ${esc(a.timeline)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

document.querySelector('[data-scope]')?.addEventListener('change', e => render(e.target.value));
