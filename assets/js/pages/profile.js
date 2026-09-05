import { initChrome, toast, icon } from '../lib/ui.js';
import { universities, activeFields, activeCountries, countries, activityCategories, activities } from '../lib/data.js';
import { getProfile, updateProfile, clearProfile, completeness, hasGrades } from '../lib/profile.js';
import { gradeSystems, gradeSystemById, englishTests, toIndex, convertToAllSystems, formatGrade } from '../lib/grades.js';
import { assessAll, activityScore } from '../lib/chances.js';
import { money, number, percent, esc } from '../lib/format.js';
import { meter, stat } from '../lib/charts.js';

initChrome({ current: 'profile.html' });

let profile = getProfile();

/** Read/write a possibly-nested key like "tests.sat". */
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ?? {})[k], obj);
}
function setPath(patchTarget, path, value) {
  const [head, tail] = path.split('.');
  if (!tail) return { [head]: value };
  return { [head]: { ...(patchTarget[head] || {}), [tail]: value } };
}

// ---------------------------------------------------------------- populate
document.querySelector('[data-field="gradeSystem"]').innerHTML =
  `<option value="">Choose your system…</option>` +
  gradeSystems.map(s => `<option value="${s.id}">${esc(s.label)} — ${esc(s.region)}</option>`).join('');

document.querySelector('[data-field="english.test"]').innerHTML =
  englishTests.map(t => `<option value="${t.id}">${esc(t.label)}</option>`).join('');

document.querySelector('[data-field="citizenship"]').innerHTML =
  `<option value="">Choose your country…</option>` +
  [...countries].sort((a, b) => a.name.localeCompare(b.name))
    .map(c => `<option value="${c.code}">${c.flag} ${esc(c.name)}</option>`).join('');

document.querySelector('[data-field-chips]').innerHTML = activeFields.map(f => `
  <button class="chip chip-btn" type="button" data-toggle-field="${f.id}" aria-pressed="false">
    ${f.icon} ${esc(f.name)}
  </button>`).join('');

document.querySelector('[data-country-chips]').innerHTML = activeCountries.map(c => `
  <button class="chip chip-btn" type="button" data-toggle-country="${c.code}" aria-pressed="false">
    ${c.flag} ${esc(c.name)}
  </button>`).join('');

document.querySelector('[data-activities]').innerHTML = activityCategories.map(cat => {
  const items = activities.filter(a => a.category === cat.id);
  return `
    <div>
      <h4 style="font-size:.85rem;margin-bottom:.5rem;color:var(--ink-2)">${cat.icon} ${esc(cat.name)}</h4>
      <div class="stack-sm">
        ${items.map(a => `
          <label class="activity-row">
            <input type="checkbox" data-toggle-activity="${a.id}">
            <span class="grow">
              <span class="activity-row__name">${esc(a.name)}</span>
              <span class="activity-row__desc" style="display:block">${esc(a.description)}</span>
            </span>
            <span class="activity-row__weight chip chip--${tierClass(a.tier)}">${esc(tierLabel(a.tier))}</span>
          </label>`).join('')}
      </div>
    </div>`;
}).join('');

function tierClass(tier) {
  return { exceptional: 'good', strong: 'brand', solid: 'outline', supporting: 'outline' }[tier] || 'outline';
}
function tierLabel(tier) {
  return { exceptional: 'Exceptional', strong: 'Strong', solid: 'Solid', supporting: 'Supporting' }[tier] || tier;
}

// ------------------------------------------------------------ grade input
function renderGradeInput() {
  const host = document.querySelector('[data-grade-input]');
  const hint = document.querySelector('[data-grade-hint]');
  const sys = gradeSystemById[profile.gradeSystem];

  if (!sys) {
    host.innerHTML = `<input class="input" disabled placeholder="Pick a grading system first">`;
    hint.textContent = '';
    return;
  }
  if (sys.kind === 'choice') {
    host.innerHTML = `<select class="select" data-field="grade">
      ${sys.options.map(o => `<option value="${esc(o.value)}">${esc(o.value)}</option>`).join('')}
    </select>`;
  } else {
    host.innerHTML = `<input class="input" type="number" data-field="grade"
      min="${sys.min}" max="${sys.max}" step="${sys.step}" placeholder="${esc(sys.placeholder)}">`;
  }
  host.querySelector('[data-field="grade"]').value = profile.grade ?? '';
  hint.textContent = sys.note || '';
}

function renderConversions() {
  const host = document.querySelector('[data-conversions]');
  const index = toIndex(profile.gradeSystem, profile.grade);
  if (index == null) { host.innerHTML = ''; return; }

  host.innerHTML = `
    <p class="small muted" style="margin-bottom:.6rem">Your result in the systems universities publish requirements in:</p>
    <div class="conversion-grid">
      ${convertToAllSystems(profile.gradeSystem, profile.grade).slice(0, 10).map(r => `
        <div class="conversion"><dt>${esc(r.short)}</dt><dd>${esc(r.display)}</dd></div>`).join('')}
    </div>`;
}

// ------------------------------------------------------------------ summary
function renderSummary() {
  const index = toIndex(profile.gradeSystem, profile.grade);
  const pct = completeness(profile);
  const ec = activityScore(profile);

  let matchBlock = `
    <div class="card callout">
      <h3>Add your grades to unlock this</h3>
      <p>As soon as you enter a result, every university on the site gets an estimated chance
         and sorts itself into likely, target and reach.</p>
    </div>`;

  if (hasGrades(profile)) {
    const { likely, target, reach, farReach } = assessAll(universities, profile);
    const affordable = profile.budget > 0
      ? universities.filter(u => u.totalCostUSD <= profile.budget).length : null;
    matchBlock = `
      <div class="card">
        <div class="card__head"><span class="card__title">Where you stand right now</span></div>
        <div class="stack-sm">
          ${bucketRow('Likely', likely.length, 'good')}
          ${bucketRow('Target', target.length, 'warning')}
          ${bucketRow('Reach', reach.length, 'serious')}
          ${bucketRow('Far reach', farReach.length, 'critical')}
        </div>
        ${affordable != null ? `
          <p class="small muted" style="margin-top:var(--sp-4)">
            ${number(affordable)} of ${number(universities.length)} fit inside your
            ${money(profile.budget, 'USD')} budget.</p>` : ''}
        <a class="btn btn--primary btn--sm btn--block" href="chances.html" style="margin-top:var(--sp-4)">
          See the full breakdown</a>
      </div>`;
  }

  document.querySelector('[data-summary]').innerHTML = `
    <div class="card">
      <div class="card__head"><span class="card__title">Profile completeness</span></div>
      ${meter(pct * 100, { status: pct >= 0.8 ? 'good' : pct >= 0.5 ? 'warning' : 'serious',
        leftLabel: `${Math.round(pct * 100)}% filled in`, rightLabel: pct >= 0.8 ? 'Ready' : 'Keep going' })}
      <div class="stat-grid stat-grid--2" style="margin-top:var(--sp-4)">
        ${stat('Academic index', index != null ? index.toFixed(0) : '—', 'Out of 100')}
        ${stat('Activity score', ec > 0 ? (ec * 100).toFixed(0) : '—', 'Out of 100')}
      </div>
      <p class="small dim" style="margin-top:var(--sp-3)">
        The academic index is one common scale we convert every grading system onto, so
        universities in different countries can be compared honestly.
      </p>
    </div>
    ${matchBlock}
    <div class="disclaimer">
      ${icon('info')}
      <span>Stored only in this browser using localStorage. Nothing is sent to a server,
      and clearing your browser data removes it.</span>
    </div>`;
}

function bucketRow(label, count, status) {
  return `
    <div class="row row--between">
      <span class="row" style="gap:.5rem">
        <span class="bucket__dot" style="background:var(--status-${status})"></span>
        <span style="font-size:.88rem">${esc(label)}</span>
      </span>
      <b class="tnum">${number(count)}</b>
    </div>`;
}

// ------------------------------------------------------------------- sync
function syncForm() {
  document.querySelector('[data-field="gradeSystem"]').value = profile.gradeSystem || '';
  document.querySelector('[data-field="tests.sat"]').value = profile.tests.sat ?? '';
  document.querySelector('[data-field="tests.act"]').value = profile.tests.act ?? '';
  document.querySelector('[data-field="english.native"]').checked = !!profile.english.native;
  document.querySelector('[data-field="english.test"]').value = profile.english.test || 'ielts';
  document.querySelector('[data-field="english.score"]').value = profile.english.score ?? '';
  document.querySelector('[data-field="citizenship"]').value = profile.citizenship || '';
  document.querySelector('[data-field="budget"]').value = profile.budget || 0;
  document.querySelector('[data-field="needsAid"]').checked = !!profile.needsAid;

  document.querySelector('[data-english-fields]').style.display = profile.english.native ? 'none' : '';
  const test = englishTests.find(t => t.id === (profile.english.test || 'ielts'));
  const scoreInput = document.querySelector('[data-field="english.score"]');
  if (test) {
    scoreInput.min = test.min; scoreInput.max = test.max; scoreInput.step = test.step;
    scoreInput.placeholder = test.placeholder;
    document.querySelector('[data-english-hint]').textContent = `Between ${test.min} and ${test.max}.`;
  }

  document.querySelector('[data-budget-hint]').textContent = profile.budget > 0
    ? `${money(profile.budget, 'USD')} a year, tuition and living combined`
    : 'No limit set — move the slider to filter by what you can afford';

  document.querySelectorAll('[data-toggle-field]').forEach(el => {
    const on = profile.fields.includes(el.dataset.toggleField);
    el.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('[data-toggle-country]').forEach(el => {
    const on = profile.countries.includes(el.dataset.toggleCountry);
    el.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('[data-toggle-activity]').forEach(el => {
    el.checked = profile.activities.includes(el.dataset.toggleActivity);
  });

  document.querySelectorAll('.range').forEach(r => {
    const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
    r.style.setProperty('--fill', `${pct}%`);
  });
}

function refresh({ rebuildGradeInput = false } = {}) {
  if (rebuildGradeInput) renderGradeInput();
  syncForm();
  renderConversions();
  renderSummary();
}

// ------------------------------------------------------------------ events
const form = document.querySelector('[data-profile-form]');

form.addEventListener('input', e => {
  const el = e.target;
  const path = el.dataset.field;
  if (!path) return;

  let value = el.type === 'checkbox' ? el.checked : el.value;
  if (el.type === 'number' || el.type === 'range') value = el.value === '' ? '' : Number(el.value);

  const wasSystem = path === 'gradeSystem';
  if (wasSystem) {
    profile = updateProfile({ gradeSystem: value, grade: '' });
    refresh({ rebuildGradeInput: true });
    return;
  }
  profile = updateProfile(setPath(profile, path, value));
  refresh();
});

form.addEventListener('change', e => {
  // The grading-system select fires `change` in some browsers before `input`.
  if (e.target.dataset.field === 'gradeSystem') return;
});

form.addEventListener('click', e => {
  const fieldBtn = e.target.closest('[data-toggle-field]');
  if (fieldBtn) {
    const id = fieldBtn.dataset.toggleField;
    let next = profile.fields.includes(id)
      ? profile.fields.filter(f => f !== id)
      : [...profile.fields, id];
    if (next.length > 3) { toast('Pick up to three subjects'); return; }
    profile = updateProfile({ fields: next });
    refresh();
    return;
  }
  const countryBtn = e.target.closest('[data-toggle-country]');
  if (countryBtn) {
    const code = countryBtn.dataset.toggleCountry;
    profile = updateProfile({
      countries: profile.countries.includes(code)
        ? profile.countries.filter(c => c !== code)
        : [...profile.countries, code]
    });
    refresh();
    return;
  }
  const activityBox = e.target.closest('[data-toggle-activity]');
  if (activityBox) {
    const id = activityBox.dataset.toggleActivity;
    profile = updateProfile({
      activities: activityBox.checked
        ? [...new Set([...profile.activities, id])]
        : profile.activities.filter(a => a !== id)
    });
    refresh();
    return;
  }
  if (e.target.closest('[data-clear-profile]')) {
    if (!confirm('Erase your grades, subjects, activities, shortlist and comparison from this browser?')) return;
    clearProfile();
    profile = getProfile();
    refresh({ rebuildGradeInput: true });
    toast('Profile erased');
  }
});

refresh({ rebuildGradeInput: true });
