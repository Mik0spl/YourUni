import { initChrome, toast, icon } from '../lib/ui.js';
import { universities, universityById, fieldById, QOL_LABELS, scholarshipsForUniversity } from '../lib/data.js';
import { getProfile, updateProfile, toggleCompare, COMPARE_LIMIT } from '../lib/profile.js';
import { assess } from '../lib/chances.js';
import { chancePill } from '../lib/cards.js';
import { money, percent, number, compactNumber, esc } from '../lib/format.js';
import { formatGrade } from '../lib/grades.js';

initChrome({ current: 'compare.html' });

const addSelect = document.querySelector('[data-add]');

function render() {
  const profile = getProfile();
  const picked = profile.compare.map(id => universityById[id]).filter(Boolean);

  // -------------------------------------------------------------- add menu
  addSelect.innerHTML = `<option value="">Choose a university…</option>` +
    universities
      .filter(u => !profile.compare.includes(u.id))
      .map(u => `<option value="${u.id}">${esc(u.name)} — ${esc(u.countryName)}</option>`).join('');
  addSelect.disabled = picked.length >= COMPARE_LIMIT;

  // ---------------------------------------------------------------- slots
  document.querySelector('[data-slots]').innerHTML = [
    ...picked.map(u => `
      <div class="compare-slot">
        <span class="compare-table__crest" style="--crest:${u.crest}" aria-hidden="true">${esc(u.initials)}</span>
        <span>${esc(u.short)}</span>
        <button class="icon-btn" type="button" data-remove="${u.id}" aria-label="Remove ${esc(u.short)}"
                style="width:24px;height:24px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`),
    ...Array.from({ length: Math.max(0, COMPARE_LIMIT - picked.length) },
      () => `<div class="compare-slot compare-slot--empty">Empty slot</div>`)
  ].join('');

  const emptyEl = document.querySelector('[data-empty]');
  const tableEl = document.querySelector('[data-table]');

  if (picked.length < 2) {
    tableEl.innerHTML = '';
    emptyEl.hidden = false;
    emptyEl.innerHTML = `
      <div class="empty" style="padding-block:4rem">
        <div class="empty__glyph" aria-hidden="true">⚖️</div>
        <h3>${picked.length === 0 ? 'Nothing to compare yet' : 'Add one more'}</h3>
        <p class="muted" style="max-width:44ch;margin-inline:auto">
          Pick universities from the menu above, or use the balance icon on any university card
          while you browse.
        </p>
        <a class="btn btn--primary" href="explore.html" style="margin-top:1.2rem">Browse universities</a>
      </div>`;
    return;
  }
  emptyEl.hidden = true;
  tableEl.innerHTML = buildTable(picked, profile);
}

function buildTable(list, profile) {
  const results = list.map(u => (profile.gradeSystem && profile.grade !== '') ? assess(u, profile) : null);

  /**
   * Rows declare how to render a value and, optionally, which direction is better —
   * so the winning cell can be highlighted rather than leaving the reader to scan.
   */
  const rows = [
    { group: 'The basics' },
    { label: 'World ranking', get: u => `#${u.rankGlobal}`, best: 'min', raw: u => u.rankGlobal },
    { label: 'Country', get: u => `${u.flag} ${esc(u.countryName)}` },
    { label: 'City', get: u => esc(u.city) },
    { label: 'Type', get: u => u.type === 'public' ? 'Public' : 'Private' },
    { label: 'Founded', get: u => String(u.founded) },
    { label: 'Students', get: u => compactNumber(u.students) },
    { label: 'International share', get: u => percent(u.intlShare, 0), best: 'max', raw: u => u.intlShare },
    { label: 'Language of teaching', get: u => esc(u.language.join(', ')) },

    { group: 'Getting in' },
    { label: 'Acceptance rate', get: u => percent(u.acceptance), best: 'max', raw: u => u.acceptance },
    { label: 'International acceptance', get: u => u.intlAcceptance ? percent(u.intlAcceptance) : '—' },
    ...(results.some(Boolean) ? [{
      label: 'Your estimated chance',
      get: (u, i) => results[i] ? chancePill(results[i]) : '—',
      best: 'max', raw: (u, i) => results[i]?.probability ?? 0
    }] : []),
    { label: 'IB requirement', get: u => u.req.ib != null ? `${u.req.ib} points` : '—', best: 'min', raw: u => u.req.ib ?? 99 },
    { label: 'A-Level requirement', get: u => u.req.alevel || '—' },
    { label: 'GPA requirement', get: u => u.req.gpa != null ? u.req.gpa.toFixed(2) : '—' },
    { label: 'IELTS minimum', get: u => u.req.ielts != null ? u.req.ielts.toFixed(1) : '—', best: 'min', raw: u => u.req.ielts ?? 9 },
    { label: 'Standardised tests', get: u => esc(testLabel(u.admissions.testPolicy)) },
    { label: 'Interview', get: u => u.admissions.interview === true ? 'Required'
        : (!u.admissions.interview || u.admissions.interview === 'none' ? 'No' : esc(String(u.admissions.interview))) },
    { label: 'Activities count for', get: u => `${Math.round(u.culture.weight * 100)}/100`, best: 'max', raw: u => u.culture.weight },

    { group: 'What it costs' },
    { label: 'Tuition a year', get: u => `${money(u.tuition.intl, u.currency)}`, best: 'min', raw: u => u.tuitionUSD },
    { label: 'Living costs a year', get: u => money(u.living, u.currency), best: 'min', raw: u => u.livingUSD },
    { label: 'Total a year (USD)', get: u => `<b>${money(u.totalCostUSD, 'USD')}</b>`, best: 'min', raw: u => u.totalCostUSD },
    { label: 'Three-year total (USD)', get: u => money(u.totalCostUSD * 3, 'USD'), best: 'min', raw: u => u.totalCostUSD },
    { label: 'EU/EEA tuition', get: u => u.tuition.eu != null && u.tuition.eu !== u.tuition.intl
        ? money(u.tuition.eu, u.currency) : 'Same rate' },
    { label: 'Scholarships listed', get: u => number(scholarshipsForUniversity(u.id).length),
      best: 'max', raw: u => scholarshipsForUniversity(u.id).length },

    { group: 'Life and outcomes' },
    { label: 'Quality of life', get: u => `${u.qolScore}/100`, best: 'max', raw: u => u.qolScore },
    ...Object.entries(QOL_LABELS).map(([key, label]) => ({
      label, get: u => `${u.qol[key]}/100`, best: 'max', raw: u => u.qol[key]
    })),
    { label: 'Graduate outcomes', get: u => `${u.employability}/100`, best: 'max', raw: u => u.employability },
    { label: 'After graduation', get: u => esc(u.countryInfo?.postStudyWork ?? '—') },
    { label: 'Work while studying', get: u => esc(u.countryInfo?.workDuringStudy ?? '—') },

    { group: 'Deadlines' },
    { label: 'Key dates', get: u => (u.admissions.deadlines || [])
        .map(d => `${esc(d.label)}: <b>${esc(d.date)}</b>`).join('<br>') || '—' },
    { label: 'Documents needed', get: u => number((u.admissions.documents || []).length) + ' items' }
  ];

  const header = `
    <thead><tr>
      <th style="width:170px"></th>
      ${list.map(u => `
        <th>
          <div class="compare-table__uni">
            <span class="compare-table__crest" style="--crest:${u.crest}" aria-hidden="true">${esc(u.initials)}</span>
            <div>
              <a href="university.html?id=${u.id}" style="font-weight:650;font-size:.92rem;text-decoration:none;color:var(--ink)">${esc(u.short)}</a>
              <div class="small dim">${esc(u.countryName)}</div>
            </div>
          </div>
        </th>`).join('')}
    </tr></thead>`;

  const body = rows.map(row => {
    if (row.group) {
      return `<tr><th colspan="${list.length + 1}"
        style="background:var(--surface-3);color:var(--brand-ink);position:static;width:auto">${esc(row.group)}</th></tr>`;
    }
    let bestIndex = -1;
    if (row.best && row.raw) {
      const values = list.map((u, i) => row.raw(u, i)).map(v => (typeof v === 'number' && !Number.isNaN(v)) ? v : null);
      const valid = values.filter(v => v != null);
      if (valid.length > 1 && new Set(valid).size > 1) {
        const target = row.best === 'min' ? Math.min(...valid) : Math.max(...valid);
        bestIndex = values.indexOf(target);
      }
    }
    return `
      <tr>
        <th>${esc(row.label)}</th>
        ${list.map((u, i) => `<td class="${i === bestIndex ? 'is-best' : ''}">${row.get(u, i)}</td>`).join('')}
      </tr>`;
  }).join('');

  return `
    <div class="compare-wrap">
      <table class="compare-table">${header}<tbody>${body}</tbody></table>
    </div>
    <p class="small dim" style="margin-top:var(--sp-4)">
      Highlighted cells mark the best value in that row where "best" is unambiguous —
      cheaper, higher ranked, more likely to admit you, better scored.
    </p>`;
}

function testLabel(policy) {
  return {
    'required': 'Required', 'optional': 'Optional', 'flexible': 'Flexible',
    'not-used': 'Not considered', 'accepted': 'Accepted', 'admissions-test': 'Own test',
    'entrance-exam': 'Entrance exam', 'varies': 'Varies by course', 'for medicine': 'Medicine only'
  }[policy] || policy || '—';
}

addSelect.addEventListener('change', e => {
  if (!e.target.value) return;
  const { full } = toggleCompare(e.target.value);
  if (full) toast(`You can compare ${COMPARE_LIMIT} universities at a time`);
  render();
});

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  const profile = getProfile();
  updateProfile({ compare: profile.compare.filter(id => id !== btn.dataset.remove) });
  render();
});

render();
