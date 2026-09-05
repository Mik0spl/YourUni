import { initChrome, initReveal, icon, query, toast } from '../lib/ui.js';
import { universities, universityById, fieldById, scholarshipsForUniversity, QOL_LABELS } from '../lib/data.js';
import { universityCard, bindCardActions, chancePill, crest } from '../lib/cards.js';
import { getProfile, hasGrades, inShortlist, toggleShortlist, inCompare, toggleCompare, COMPARE_LIMIT } from '../lib/profile.js';
import { assess } from '../lib/chances.js';
import { chanceDial, scoreBars, stackedBar, stat, meter, positionBar } from '../lib/charts.js';
import { money, percent, number, compactNumber, esc } from '../lib/format.js';
import { formatGrade, fromIndex, gradeSystemById, toIndex } from '../lib/grades.js';

initChrome({ current: 'explore.html' });

const uni = universityById[query('id')] || null;

if (!uni) {
  document.querySelector('#main').innerHTML = `
    <div class="container"><div class="empty" style="padding-block:6rem">
      <div class="empty__glyph">🧭</div>
      <h3>We don't have that university</h3>
      <p class="muted">It may have been renamed, or the link is wrong.</p>
      <a class="btn btn--primary" href="explore.html" style="margin-top:1rem">Browse all universities</a>
    </div></div>`;
  // The "similar universities" section lives inside #main, so replacing the
  // markup above has already removed it — nothing further to hide.
} else {
  document.title = `${uni.name} — YourUni`;
  render();
}

function render() {
  const profile = getProfile();
  const result = hasGrades(profile) ? assess(uni, profile) : null;
  const country = uni.countryInfo;

  // ------------------------------------------------------------------ hero
  document.querySelector('[data-hero]').innerHTML = `
    <div class="container container--wide">
      <p class="small" style="margin-bottom:var(--sp-4)">
        <a href="explore.html" style="color:var(--ink-2);text-decoration:none">Universities</a>
        <span class="dim"> / </span>
        <a href="explore.html?country=${uni.country}" style="color:var(--ink-2);text-decoration:none">${esc(uni.countryName)}</a>
        <span class="dim"> / </span><span class="dim">${esc(uni.short)}</span>
      </p>
      <div class="uni-hero__top">
        <span class="uni-hero__crest" style="--crest:${uni.crest}" aria-hidden="true">${esc(uni.initials)}</span>
        <div class="grow">
          <h1>${esc(uni.name)}</h1>
          <div class="uni-hero__meta">
            <span>${uni.flag} ${esc(uni.city)}</span>
            <span>${icon('pin')} ${esc(uni.type === 'public' ? 'Public university' : 'Private university')}</span>
            <span>Founded ${uni.founded}</span>
            <span>${compactNumber(uni.students)} students</span>
          </div>
          <div class="uni-card__tags" style="margin-top:var(--sp-3)">
            ${(uni.strongFields || []).map(f =>
              `<a class="chip chip--brand" href="explore.html?field=${f}">${esc(fieldById[f]?.name ?? f)}</a>`).join('')}
            <span class="chip chip--outline">#${uni.rankGlobal} in the world</span>
          </div>
        </div>
        <div class="uni-hero__actions">
          <button class="btn btn--secondary btn--sm" type="button" data-shortlist-btn>
            ${icon('pin')} <span>${inShortlist(uni.id) ? 'Saved' : 'Save'}</span>
          </button>
          <button class="btn btn--secondary btn--sm" type="button" data-compare-btn>
            ${icon('scale')} <span>${inCompare(uni.id) ? 'In comparison' : 'Compare'}</span>
          </button>
          <a class="btn btn--primary btn--sm" href="${esc(uni.website)}" target="_blank" rel="noopener noreferrer">
            Official site ${icon('arrow')}
          </a>
        </div>
      </div>
    </div>`;

  // -------------------------------------------------------------- side rail
  document.querySelector('[data-side]').innerHTML = result
    ? sideWithChance(result, profile)
    : sideWithoutChance();

  // ---------------------------------------------------------------- panels
  panel('overview', overviewPanel(result));
  panel('requirements', requirementsPanel(profile, result));
  panel('cost', costPanel());
  panel('life', lifePanel(country));
  panel('apply', applyPanel());

  // -------------------------------------------------------------- similar
  const primaryField = uni.strongFields?.[0] ?? uni.fields[0];
  const similar = universities
    .filter(u => u.id !== uni.id && u.fields.includes(primaryField))
    .map(u => ({ u, distance: Math.abs(u.requiredIndex - uni.requiredIndex) + Math.abs(u.rankGlobal - uni.rankGlobal) / 60 }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6)
    .map(x => x.u);
  document.querySelector('[data-similar-title]').textContent =
    `Other strong ${fieldById[primaryField]?.name.toLowerCase() ?? 'universities'} options`;
  const similarHost = document.querySelector('[data-similar]');
  similarHost.innerHTML = similar
    .map(u => universityCard(u, hasGrades(profile) ? assess(u, profile) : null)).join('');
  bindCardActions(similarHost);

  wireTabs();
  wireActions();
  initReveal();
}

function panel(name, html) {
  document.querySelector(`[data-panel="${name}"]`).innerHTML = html;
}

// ------------------------------------------------------------------- side
function sideWithChance(result, profile) {
  const { band, probability } = result;
  const blockers = result.blockers.length ? `
    <div class="card card--quiet" style="border-color:var(--status-critical-wash)">
      <span class="eyebrow" style="color:var(--status-critical-ink)">Before you apply</span>
      <ul style="list-style:none;padding:0;margin-top:.6rem;display:grid;gap:.7rem">
        ${result.blockers.map(b => `
          <li>
            <strong style="font-size:.87rem">${esc(b.label)}</strong>
            <p class="small muted" style="margin-top:.15rem">${esc(b.detail)}</p>
          </li>`).join('')}
      </ul>
    </div>` : '';

  const improvements = result.improvements.length ? `
    <div class="card">
      <div class="card__head"><span class="card__title">What would help most</span></div>
      <div class="factor-list">
        ${result.improvements.slice(0, 3).map(i => `
          <div class="factor">
            <span class="factor__name">${esc(i.label)}</span>
            <span class="factor__delta">${i.meaningful ? '+' + (i.delta * 100).toFixed(1) + 'pp' : 'minor'}</span>
            <span class="factor__desc">${esc(i.description)}</span>
          </div>`).join('')}
      </div>
      <a class="btn btn--ghost btn--sm btn--block" href="chances.html#improve" style="margin-top:.8rem">
        See every lever ${icon('arrow')}</a>
    </div>` : '';

  return `
    <div class="card chance-panel">
      <span class="eyebrow">Your estimated chance</span>
      ${chanceDial(probability, band)}
      <span class="chip chip--${band.status}" style="font-weight:650">${esc(band.label)}</span>
      <p class="small muted" style="margin-top:.7rem">${esc(band.blurb)}</p>
      <hr class="divider" style="margin:var(--sp-4) 0">
      <div style="text-align:left">
        ${meter(Math.max(0, Math.min(100, result.index)), {
          status: result.gradeGap >= 0 ? 'good' : 'warning',
          leftLabel: `You: ${result.index.toFixed(0)}`,
          rightLabel: `They ask: ${result.requiredIndex.toFixed(0)}`,
          label: 'Academic index'
        })}
        <p class="small dim" style="margin-top:.6rem">
          ${result.gradeGap >= 0
            ? `You are ${result.gradeGap.toFixed(0)} points above their typical requirement.`
            : `You are ${Math.abs(result.gradeGap).toFixed(0)} points below their typical requirement.`}
        </p>
      </div>
    </div>
    ${blockers}
    ${improvements}`;
}

function sideWithoutChance() {
  return `
    <div class="card callout">
      <h3>Will you get in?</h3>
      <p>Add your grades and we will estimate your chance here, show how far you are from
         their requirement, and list what would move the number most.</p>
      <a class="btn btn--primary btn--sm" href="profile.html">Add your grades</a>
    </div>
    <div class="card">
      <div class="card__head"><span class="card__title">At a glance</span></div>
      <div class="stat-grid stat-grid--2">
        ${stat('Acceptance rate', percent(uni.acceptance))}
        ${stat('International', percent(uni.intlShare, 0))}
        ${stat('World rank', '#' + uni.rankGlobal)}
        ${stat('Employability', uni.employability + '/100')}
      </div>
    </div>`;
}

// --------------------------------------------------------------- overview
function overviewPanel(result) {
  const allCosts = universities.map(u => u.totalCostUSD);
  return `
    <div class="card">
      <p class="lede" style="font-size:var(--step-1)">${esc(uni.blurb)}</p>
    </div>

    <div class="stat-grid">
      ${stat('World ranking', '#' + uni.rankGlobal, uni.rankingSource || 'Composite of major rankings')}
      ${stat('Acceptance rate', percent(uni.acceptance),
             uni.intlAcceptance && uni.intlAcceptance !== uni.acceptance
               ? `${percent(uni.intlAcceptance)} for international applicants` : 'All applicants')}
      ${stat('Total cost a year', money(uni.totalCost, uni.currency, { compact: true }),
             uni.currency === 'USD' ? 'Tuition plus living' : `≈ ${money(uni.totalCostUSD, 'USD', { compact: true })} · tuition plus living`)}
      ${stat('Quality of life', uni.qolScore + '/100', 'Composite of six measures')}
      ${stat('Students', compactNumber(uni.students), `${percent(uni.intlShare, 0)} from abroad`)}
      ${stat('Graduate outcomes', uni.employability + '/100', 'Employer reputation and placement')}
    </div>

    <div class="card">
      <div class="card__head">
        <span class="card__title">Where the cost sits</span>
        <span class="small dim">Against all ${universities.length} universities here</span>
      </div>
      ${positionBar(uni.totalCostUSD, Math.min(...allCosts), Math.max(...allCosts), {
        lowLabel: money(Math.min(...allCosts), 'USD', { compact: true }),
        highLabel: money(Math.max(...allCosts), 'USD', { compact: true }),
        valueLabel: `${uni.short} costs ${money(uni.totalCostUSD, 'USD')} a year`
      })}
      <p class="small muted" style="margin-top:.7rem">
        ${uni.short} costs about ${money(uni.totalCostUSD, 'USD')} a year all in —
        cheaper than ${percent(universities.filter(u => u.totalCostUSD > uni.totalCostUSD).length / universities.length, 0)}
        of the universities on this site.
      </p>
    </div>

    ${outcomesCard()}

    <div class="card">
      <div class="card__head"><span class="card__title">Subjects taught here</span></div>
      <div class="uni-card__tags">
        ${uni.fields.map(f => {
          const strong = uni.strongFields?.includes(f);
          const tip = strong ? 'data-tip="One of the departments this university is best known for"' : '';
          return `<a class="chip ${strong ? 'chip--brand' : 'chip--outline'}" href="explore.html?field=${f}" ${tip}>
                    ${esc(fieldById[f]?.name ?? f)}${strong ? ' \u2605' : ''}</a>`;
        }).join('')}
      </div>
      <p class="small dim" style="margin-top:.8rem">★ marks the departments this university is best known for.</p>
    </div>`;
}

/**
 * Published outcomes, shown only where we actually have them. Every figure here
 * is measured and attributed — it is deliberately separated from the site's own
 * estimates so a student can tell the two apart.
 */
function outcomesCard() {
  const o = uni.outcomes;
  if (!o) return '';

  const tiles = [];
  if (o.employmentPct != null)
    tiles.push(stat('In work or study', `${o.employmentPct}%`, '15 months after graduating'));
  if (o.medianSalary3yr != null)
    tiles.push(stat('Median salary', money(o.medianSalary3yr, 'GBP', { compact: true }), '3 years after graduating'));
  if (o.satisfactionPct != null)
    tiles.push(stat('Student satisfaction', `${o.satisfactionPct}%`, 'National Student Survey'));
  if (o.continuationPct != null)
    tiles.push(stat('Continue to year 2', `${o.continuationPct}%`, 'Retention after first year'));
  if (o.tef)
    tiles.push(stat('Teaching quality', esc(o.tef), 'TEF overall rating'));
  if (o.meanTariff != null)
    tiles.push(stat('Mean entry tariff', String(o.meanTariff), 'UCAS points of actual entrants'));
  if (!tiles.length) return '';

  const intake = o.shareTariff144Plus != null ? `
    <div style="margin-top:var(--sp-5)">
      <p class="small muted" style="margin-bottom:.7rem">
        What entrants actually held — more useful than an offer, because it shows the
        real spread rather than the headline requirement.
      </p>
      ${scoreBars([
        { label: 'AAA or better', value: o.shareTariff144Plus },
        { label: 'A*A*A or better', value: o.shareTariff160Plus ?? 0 }
      ])}
    </div>` : '';

  return `
    <div class="card">
      <div class="card__head">
        <span class="card__title">Published outcomes</span>
        <span class="chip chip--good">Measured, not estimated</span>
      </div>
      <div class="stat-grid">${tiles.join('')}</div>
      ${intake}
      <p class="small dim" style="margin-top:var(--sp-4)">
        Source: ${esc(uni.outcomesSource ?? 'Discover Uni')}. Figures cover UK-domiciled
        graduates across the whole university, so a specific course may differ.
      </p>
    </div>`;
}

// ----------------------------------------------------------- requirements
function requirementsPanel(profile, result) {
  const sys = profile.gradeSystem ? gradeSystemById[profile.gradeSystem] : null;
  const yourIndex = result?.index ?? null;

  const rows = [
    ['IB Diploma', uni.req.ib != null ? `${uni.req.ib} points` : null, 'ib', uni.req.ib],
    ['A-Levels', uni.req.alevel || null, 'alevel', uni.req.alevel],
    ['US GPA', uni.req.gpa != null ? uni.req.gpa.toFixed(2) : null, 'gpa4', uni.req.gpa],
    ['SAT', uni.req.sat != null ? String(uni.req.sat) : null, null, null],
    ['ACT', uni.req.act != null ? String(uni.req.act) : null, null, null],
    ['IELTS', uni.req.ielts != null ? uni.req.ielts.toFixed(1) : null, null, null],
    ['TOEFL iBT', uni.req.toefl != null ? String(uni.req.toefl) : null, null, null]
  ].filter(r => r[1]);

  // Your equivalent in the university's own terms.
  const yourEquivalents = {};
  if (yourIndex != null) {
    yourEquivalents.ib = formatGrade('ib', fromIndex('ib', yourIndex));
    yourEquivalents.alevel = fromIndex('alevel', yourIndex);
    yourEquivalents.gpa4 = formatGrade('gpa4', fromIndex('gpa4', yourIndex));
  }

  return `
    <div class="card">
      <div class="card__head">
        <span class="card__title">Typical entry requirements</span>
        ${yourIndex != null ? `<span class="chip chip--brand">Your ${esc(sys?.short ?? 'grades')} converted</span>` : ''}
      </div>
      ${rows.map(([label, need, systemId]) => {
        const yours = systemId ? yourEquivalents[systemId] : null;
        let verdict = '';
        if (yours && systemId) {
          const needIdx = toIndex(systemId, uni.req[systemId === 'gpa4' ? 'gpa' : systemId]);
          const meets = needIdx != null && yourIndex >= needIdx - 0.5;
          verdict = `<span class="chip chip--${meets ? 'good' : 'critical'}">${meets ? 'Meets' : 'Below'}</span>`;
        }
        return `
          <div class="req-row">
            <span class="req-row__name">${esc(label)}</span>
            <span class="req-row__need">${esc(need)}${yours ? ` <span class="dim">· you ≈ ${esc(yours)}</span>` : ''}</span>
            ${verdict}
          </div>`;
      }).join('')}
      ${uni.req.note ? `<p class="small muted" style="margin-top:var(--sp-4)">${esc(uni.req.note)}</p>` : ''}
      ${yourIndex == null ? `
        <p class="small" style="margin-top:var(--sp-4)">
          <a href="profile.html">Add your grades</a> to see these converted into your own system.
        </p>` : ''}
    </div>

    <div class="card">
      <div class="card__head"><span class="card__title">Subjects you need to have taken</span></div>
      <ul class="doc-list">
        ${(uni.req.subjects || []).map(s => `<li>${icon('check')}<span>${esc(s)}</span></li>`).join('')}
      </ul>
    </div>

    <div class="card">
      <div class="card__head"><span class="card__title">How they decide</span></div>
      <div class="stat-grid">
        ${stat('Admissions style', esc(uni.culture.label))}
        ${stat('Tests', esc(testPolicyLabel(uni.admissions.testPolicy)))}
        ${stat('Interview', esc(labelFor(uni.admissions.interview)))}
        ${stat('Essays', uni.admissions.essays === true ? 'Required' : (uni.admissions.essays || 'Not required'))}
        ${stat('Portfolio', uni.admissions.portfolio === true ? 'Required' : (uni.admissions.portfolio || 'Not required'))}
      </div>
      <p class="small muted" style="margin-top:var(--sp-4)">${esc(uni.culture.note)}</p>
      <div style="margin-top:var(--sp-4)">
        ${meter(uni.culture.weight * 100, {
          status: uni.culture.weight >= 0.5 ? 'good' : uni.culture.weight >= 0.25 ? 'warning' : 'serious',
          leftLabel: 'Grades decide almost everything',
          rightLabel: 'Whole application is read',
          label: 'How much your activities count here'
        })}
      </div>
    </div>`;
}

function testPolicyLabel(policy) {
  return {
    'required': 'SAT/ACT required', 'optional': 'Test-optional', 'flexible': 'Test-flexible',
    'not-used': 'Tests not considered', 'accepted': 'Tests accepted, not required',
    'admissions-test': 'Own admissions test', 'entrance-exam': 'Entrance examination',
    'varies': 'Varies by course', 'for medicine': 'Only for medicine'
  }[policy] || policy || 'Not stated';
}

function labelFor(value) {
  if (value === true) return 'Required';
  if (!value || value === 'none') return 'No interview';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

// --------------------------------------------------------------------- cost
function costPanel() {
  const scholars = scholarshipsForUniversity(uni.id);
  const c = uni.currency;
  const eu = uni.tuition.eu != null && uni.tuition.eu !== uni.tuition.intl;

  return `
    <div class="card">
      <div class="card__head">
        <span class="card__title">What a year costs</span>
        <span class="small dim">In ${c}</span>
      </div>
      ${stackedBar([
        { label: 'Tuition', value: uni.tuition.intl },
        { label: 'Living costs', value: uni.living }
      ], { currency: c, id: 'cost-' + uni.id })}
      ${eu ? `
        <div class="disclaimer" style="margin-top:var(--sp-4)">
          ${icon('info')}
          <span>EU/EEA students pay <b>${money(uni.tuition.eu, c)}</b> in tuition rather than
          ${money(uni.tuition.intl, c)} — a difference of ${money(uni.tuition.intl - uni.tuition.eu, c)} a year.</span>
        </div>` : ''}
      ${uni.countryInfo?.tuitionNote ? `<p class="small muted" style="margin-top:var(--sp-4)">${esc(uni.countryInfo.tuitionNote)}</p>` : ''}
    </div>

    <div class="card">
      <div class="card__head"><span class="card__title">Also budget for</span></div>
      <ul class="doc-list">
        <li>${icon('check')}<span><b>Health cover.</b> ${esc(uni.countryInfo?.healthcare ?? 'Check the university requirement.')}</span></li>
        <li>${icon('check')}<span><b>Visa and travel.</b> Application fees, flights home and a deposit are rarely in the published figure.</span></li>
        <li>${icon('check')}<span><b>Work rights.</b> ${esc(uni.countryInfo?.workDuringStudy ?? '—')}</span></li>
        <li>${icon('check')}<span><b>After you graduate.</b> ${esc(uni.countryInfo?.postStudyWork ?? '—')}</span></li>
      </ul>
    </div>

    <div class="card">
      <div class="card__head">
        <span class="card__title">Scholarships</span>
        <a class="small" href="scholarships.html?university=${uni.id}">All ${scholars.length}</a>
      </div>
      <div class="stack">
        ${scholars.slice(0, 4).map(s => `
          <div class="scholarship-card" style="padding:var(--sp-4)">
            <div class="scholarship-card__head">
              <div>
                <div class="scholarship-card__name">${esc(s.name)}</div>
                <div class="scholarship-card__provider">${esc(s.provider)}</div>
              </div>
              <div class="scholarship-card__amount">
                ${s.coverage === 'full' ? 'Full' : 'Partial'}<small>${esc(s.type.replace('-', ' '))}</small>
              </div>
            </div>
            <p class="small muted">${esc(s.amount.text ?? money(s.amount.value, s.amount.currency) + ' per ' + s.amount.period)}</p>
          </div>`).join('')}
      </div>
    </div>`;
}

// -------------------------------------------------------------------- life
function lifePanel(country) {
  const bars = Object.entries(QOL_LABELS).map(([key, label]) => ({ label, value: uni.qol[key] ?? 50 }));
  return `
    <div class="card">
      <div class="card__head">
        <span class="card__title">Quality of life in ${esc(uni.city.split(',')[0])}</span>
        <span class="rank-badge">${uni.qolScore}<span>/100</span></span>
      </div>
      ${scoreBars(bars)}
      <p class="small dim" style="margin-top:var(--sp-4)">
        Higher is better on every measure, affordability included — a high affordability score
        means your money goes further.
      </p>
    </div>

    <div class="card">
      <div class="card__head"><span class="card__title">Practicalities in ${esc(country?.name ?? uni.countryName)}</span></div>
      <div class="stat-grid stat-grid--2">
        ${stat('Languages', (country?.language ?? []).join(', '))}
        ${stat('English-taught degrees', esc(country?.englishTaught ?? '—'))}
        ${stat('Student visa', ['—', 'Straightforward', 'Manageable', 'Some effort', 'Demanding', 'Hard'][country?.visaDifficulty ?? 0] ?? '—')}
        ${stat('Safety', (country?.safety ?? '—') + '/100')}
      </div>
      ${countryStatsBlock(country)}
      <div class="stack" style="margin-top:var(--sp-4)">
        <p class="small muted"><b>Working while studying.</b> ${esc(country?.workDuringStudy ?? '—')}</p>
        <p class="small muted"><b>Staying after graduation.</b> ${esc(country?.postStudyWork ?? '—')}</p>
        <p class="small muted"><b>Healthcare.</b> ${esc(country?.healthcare ?? '—')}</p>
      </div>
    </div>`;
}

/** National figures from Eurostat, where the country is covered. */
function countryStatsBlock(country) {
  const s = country?.stats;
  if (!s) return '';
  const tiles = [];
  if (s.graduateEmployment != null)
    tiles.push(stat('Graduate employment', `${s.graduateEmployment}%`, `Nationally, ${s.graduateEmploymentYear}`));
  if (s.neetRate != null)
    tiles.push(stat('Young people not working or studying', `${s.neetRate}%`, `Aged 15-29, ${s.neetRateYear}`));
  if (s.earlyLeavers != null)
    tiles.push(stat('Leave education early', `${s.earlyLeavers}%`, `Aged 18-24, ${s.earlyLeaversYear}`));
  if (!tiles.length) return '';
  return `
    <div style="margin-top:var(--sp-5)">
      <h4 style="font-size:.9rem;margin-bottom:.7rem">The national picture</h4>
      <div class="stat-grid">${tiles.join('')}</div>
      <p class="small dim" style="margin-top:var(--sp-3)">
        Source: Eurostat. Country-wide figures, not specific to this university.
      </p>
    </div>`;
}

// ------------------------------------------------------------------- apply
function applyPanel() {
  return `
    <div class="card">
      <div class="card__head"><span class="card__title">Key dates</span></div>
      <div class="deadline-list">
        ${(uni.admissions.deadlines || []).map(d => `
          <div class="deadline"><span>${esc(d.label)}</span><b>${esc(d.date)}</b></div>`).join('')}
      </div>
      <p class="small dim" style="margin-top:var(--sp-4)">
        Dates repeat annually but shift by a day or two — confirm on the university's own site
        before you rely on them.
      </p>
    </div>

    <div class="card">
      <div class="card__head"><span class="card__title">What you need to submit</span></div>
      <ul class="doc-list">
        ${(uni.admissions.documents || []).map(d => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('')}
      </ul>
    </div>

    <div class="card callout">
      <h3>What actually moves the decision here</h3>
      <p>${esc(uni.culture.note)}</p>
      <a class="btn btn--secondary btn--sm" href="chances.html#improve" style="justify-self:start">
        See which activities count ${icon('arrow')}</a>
    </div>`;
}

// -------------------------------------------------------------------- tabs
function wireTabs() {
  const tabs = [...document.querySelectorAll('[data-tabs] [role="tab"]')];
  const show = name => {
    tabs.forEach(t => {
      const active = t.getAttribute('aria-controls') === `panel-${name}`;
      t.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.hidden = p.dataset.panel !== name;
    });
    initReveal();
  };
  tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('aria-controls').replace('panel-', ''))));

  // Arrow-key navigation between tabs, as expected of a tablist.
  document.querySelector('[data-tabs]').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); next.focus(); next.click(); }
  });
}

function wireActions() {
  document.querySelector('[data-shortlist-btn]')?.addEventListener('click', e => {
    const added = toggleShortlist(uni.id);
    e.currentTarget.querySelector('span').textContent = added ? 'Saved' : 'Save';
    toast(added ? 'Saved to your shortlist' : 'Removed from your shortlist');
  });
  document.querySelector('[data-compare-btn]')?.addEventListener('click', e => {
    const { active, full } = toggleCompare(uni.id);
    if (full) { toast(`You can compare ${COMPARE_LIMIT} universities at a time`); return; }
    e.currentTarget.querySelector('span').textContent = active ? 'In comparison' : 'Compare';
    toast(active ? 'Added to comparison' : 'Removed from comparison');
  });
}
