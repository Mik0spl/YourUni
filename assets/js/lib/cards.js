/** The university card, shared by the home, explore, chances and shortlist views. */
import { money, percent, compactNumber, esc } from './format.js';
import { fieldById } from './data.js';
import { icon } from './ui.js';
import { inCompare, inShortlist, getProfile } from './profile.js';

const bandIcons = {
  good:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  warning:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.2v.1"/></svg>',
  serious:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4"/><path d="M12 17.2v.1"/></svg>',
  critical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>'
};

/**
 * A chance is never colour alone — every pill carries an icon and the band name.
 * That is what makes the status colours legible for colour-blind readers.
 */
export function chancePill(result) {
  if (!result) return '';
  const { band, probability } = result;
  const pct = probability < 0.1 ? (probability * 100).toFixed(1) : Math.round(probability * 100);
  return `<span class="chance-pill chip--${band.status}" title="${esc(band.blurb)}">
    ${bandIcons[band.status]}${esc(band.label)} · ${pct}%
  </span>`;
}

export function crest(uni, size = 44) {
  return `<span class="uni-card__crest" style="--crest:${uni.crest};width:${size}px;height:${size}px"
    aria-hidden="true">${esc(uni.initials)}</span>`;
}

/**
 * @param uni      decorated university record
 * @param result   optional chance assessment to show on the card
 */
export function universityCard(uni, result = null, { showCompare = true } = {}) {
  const profile = getProfile();
  const compared = inCompare(uni.id, profile);
  const saved = inShortlist(uni.id, profile);

  const tags = (uni.strongFields || []).slice(0, 2)
    .map(f => `<span class="chip chip--brand">${esc(fieldById[f]?.name ?? f)}</span>`).join('');
  const langTag = uni.language.includes('English')
    ? '<span class="chip chip--outline">English-taught</span>' : '';

  return `
  <article class="uni-card reveal" data-uni="${uni.id}" style="--crest:${uni.crest}">
    <div class="uni-card__top">
      ${crest(uni)}
      <div class="grow">
        <h3 class="uni-card__name"><a href="university.html?id=${uni.id}">${esc(uni.name)}</a></h3>
        <p class="uni-card__place">${uni.flag} ${esc(uni.city)}</p>
      </div>
      <div class="uni-card__rank">
        <span class="rank-badge">#${uni.rankGlobal}<span>world</span></span>
      </div>
    </div>

    <dl class="uni-card__stats">
      <div class="uni-card__stat">
        <dt>Acceptance</dt>
        <dd>${percent(uni.acceptance)}</dd>
      </div>
      <div class="uni-card__stat" data-tip="Tuition ${money(uni.tuition.intl, uni.currency)} + living ${money(uni.living, uni.currency)} per year, in ${uni.currency}">
        <dt>Cost / year</dt>
        <dd>${uni.currency === 'USD' ? '' : '≈'}${money(uni.totalCostUSD, 'USD', { compact: true })}</dd>
      </div>
      <div class="uni-card__stat">
        <dt>Quality of life</dt>
        <dd>${uni.qolScore}<span style="font-size:.7em;color:var(--ink-3)">/100</span></dd>
      </div>
    </dl>

    <div class="uni-card__body">
      <div class="uni-card__tags">${tags}${langTag}</div>
      ${result ? `<div>${chancePill(result)}</div>` : ''}
      <div class="uni-card__foot">
        <span class="small dim">${compactNumber(uni.students)} students · ${percent(uni.intlShare, 0)} international</span>
        ${showCompare ? `
        <div class="row uni-card__compare" style="gap:.25rem">
          <button class="icon-btn" type="button" data-shortlist="${uni.id}"
                  aria-pressed="${saved}" aria-label="${saved ? 'Remove from' : 'Add to'} shortlist"
                  data-tip="${saved ? 'Saved to your shortlist' : 'Save to your shortlist'}"
                  style="${saved ? 'color:var(--brand-ink)' : ''}">${icon('pin')}</button>
          <button class="icon-btn" type="button" data-compare="${uni.id}"
                  aria-pressed="${compared}" aria-label="${compared ? 'Remove from' : 'Add to'} comparison"
                  data-tip="${compared ? 'In your comparison' : 'Add to comparison'}"
                  style="${compared ? 'color:var(--brand-ink)' : ''}">${icon('scale')}</button>
        </div>` : ''}
      </div>
    </div>
  </article>`;
}

/**
 * Wire the save/compare buttons for a container of cards.
 * Uses delegation so re-rendering the list never needs re-binding.
 */
export function bindCardActions(container, { onChange } = {}) {
  container.addEventListener('click', async e => {
    const shortlistBtn = e.target.closest('[data-shortlist]');
    const compareBtn = e.target.closest('[data-compare]');
    if (!shortlistBtn && !compareBtn) return;

    e.preventDefault();
    const { toggleShortlist, toggleCompare, COMPARE_LIMIT } = await import('./profile.js');
    const { toast } = await import('./ui.js');

    if (shortlistBtn) {
      const added = toggleShortlist(shortlistBtn.dataset.shortlist);
      shortlistBtn.setAttribute('aria-pressed', String(added));
      shortlistBtn.style.color = added ? 'var(--brand-ink)' : '';
      shortlistBtn.dataset.tip = added ? 'Saved to your shortlist' : 'Save to your shortlist';
      toast(added ? 'Saved to your shortlist' : 'Removed from your shortlist');
    } else {
      const { active, full } = toggleCompare(compareBtn.dataset.compare);
      if (full) { toast(`You can compare ${COMPARE_LIMIT} universities at a time`); return; }
      compareBtn.setAttribute('aria-pressed', String(active));
      compareBtn.style.color = active ? 'var(--brand-ink)' : '';
      compareBtn.dataset.tip = active ? 'In your comparison' : 'Add to comparison';
      toast(active ? 'Added to comparison' : 'Removed from comparison');
    }
    onChange?.();
  });
}
