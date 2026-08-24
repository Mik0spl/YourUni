import { initChrome, initReveal } from '../lib/ui.js';
import { universities, activeFields, activeCountries, scholarships, fieldById } from '../lib/data.js';
import { universityCard, bindCardActions } from '../lib/cards.js';
import { gradeSystems, gradeSystemById, toIndex, convertToAllSystems, formatGrade } from '../lib/grades.js';
import { getProfile, hasGrades } from '../lib/profile.js';
import { assessAll } from '../lib/chances.js';
import { money, number, esc } from '../lib/format.js';

initChrome({ current: 'index.html' });

// ------------------------------------------------------------------- numbers
document.querySelector('[data-trust]').innerHTML = [
  [number(universities.length), 'universities'],
  [number(activeCountries.length), 'countries'],
  [number(scholarships.length), 'scholarships'],
  [number(gradeSystems.length), 'grading systems']
].map(([n, t]) => `<div><span class="n tnum">${n}</span><span class="t">${t}</span></div>`).join('');

// ---------------------------------------------------------- grade converter
const systemSelect = document.querySelector('[data-conv-system]');
const inputHost = document.querySelector('[data-conv-input-host]');
const hint = document.querySelector('[data-conv-hint]');
const output = document.querySelector('[data-conv-output]');

systemSelect.innerHTML = gradeSystems
  .map(s => `<option value="${s.id}">${esc(s.label)} — ${esc(s.region)}</option>`).join('');

const saved = getProfile();
let currentSystem = saved.gradeSystem || 'ib';
let currentValue = saved.grade || null;
systemSelect.value = currentSystem;

function renderInput() {
  const sys = gradeSystemById[currentSystem];
  if (sys.kind === 'choice') {
    inputHost.innerHTML = `<select class="select" data-conv-value>
      ${sys.options.map(o => `<option value="${esc(o.value)}">${esc(o.value)}</option>`).join('')}
    </select>`;
    currentValue = sys.options.some(o => o.value === currentValue) ? currentValue : 'AAA';
  } else {
    inputHost.innerHTML = `<input class="input" type="number" data-conv-value
      min="${sys.min}" max="${sys.max}" step="${sys.step}" placeholder="${esc(sys.placeholder)}">`;
    const numeric = Number(currentValue);
    currentValue = Number.isFinite(numeric) && numeric >= sys.min && numeric <= sys.max
      ? numeric : Number(sys.placeholder);
  }
  inputHost.querySelector('[data-conv-value]').value = currentValue;
  hint.textContent = sys.note || '';
  inputHost.querySelector('[data-conv-value]').addEventListener('input', e => {
    currentValue = e.target.value;
    renderOutput();
  });
}

function renderOutput() {
  const index = toIndex(currentSystem, currentValue);
  if (index == null) {
    output.innerHTML = `<p class="muted small">Enter a result to see the conversions.</p>`;
    return;
  }
  const rows = convertToAllSystems(currentSystem, currentValue).slice(0, 11);
  output.innerHTML = `
    <div class="conversion" style="background:var(--brand-wash);border-color:transparent">
      <dt style="color:var(--brand-ink)">Academic index</dt>
      <dd style="color:var(--brand-ink)">${index.toFixed(0)}<span style="font-size:.6em;font-weight:500">/100</span></dd>
    </div>
    ${rows.map(r => `
      <div class="conversion" data-tip="${esc(r.label)} — ${esc(r.region)}">
        <dt>${esc(r.short)}</dt><dd>${esc(r.display)}</dd>
      </div>`).join('')}`;
}

systemSelect.addEventListener('change', e => {
  currentSystem = e.target.value;
  currentValue = null;
  renderInput();
  renderOutput();
});
renderInput();
renderOutput();

// --------------------------------------------------------------- your matches
const profile = getProfile();
if (hasGrades(profile)) {
  const { likely, target } = assessAll(universities, profile);
  const picks = [...target, ...likely].slice(0, 6);
  if (picks.length) {
    const section = document.querySelector('[data-matches-section]');
    section.hidden = false;
    document.querySelector('[data-matches-sub]').textContent =
      `${target.length} target and ${likely.length} likely matches from your ${formatGrade(profile.gradeSystem, profile.grade)}.`;
    document.querySelector('[data-matches]').innerHTML =
      picks.map(p => universityCard(p.uni, p.result)).join('');
  }
}

// -------------------------------------------------------------------- fields
document.querySelector('[data-fields]').innerHTML = activeFields.map(f => `
  <a class="field-card reveal" href="explore.html?field=${f.id}">
    <span class="field-card__icon" aria-hidden="true">${f.icon}</span>
    <span>
      <span class="field-card__name">${esc(f.name)}</span><br>
      <span class="field-card__count">${f.count} universities</span>
    </span>
  </a>`).join('');

// ------------------------------------------------------------------ listings
document.querySelector('[data-top]').innerHTML =
  universities.slice(0, 6).map(u => universityCard(u)).join('');

const bestValue = universities
  .filter(u => u.rankGlobal <= 150)
  .sort((a, b) => a.totalCostUSD - b.totalCostUSD)
  .slice(0, 6);
document.querySelector('[data-value]').innerHTML = bestValue.map(u => universityCard(u)).join('');

bindCardActions(document.querySelector('main'));
initReveal();
