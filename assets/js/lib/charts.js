/**
 * Chart renderers. All return HTML strings.
 *
 * Colour rules follow the project's validated palette:
 *   - magnitude across nominal categories -> ONE hue (never colour by value)
 *   - part-to-whole -> categorical slots 1..n, in fixed order, 2px surface gaps
 *   - a single ratio against a limit -> meter, fill carries severity
 * The categorical slots sit below 3:1 against the light surface, so every
 * stacked bar ships direct value labels and a table view as the relief channel.
 */
import { money, percent, esc } from './format.js';

/** Radial gauge for an admission probability. */
export function chanceDial(probability, band, { size = 160, caption = 'chance of an offer' } = {}) {
  const r = 62;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(probability, 1));
  const pct = probability < 0.1 ? (probability * 100).toFixed(1) : Math.round(probability * 100);

  return `
  <div class="chance-dial" style="width:${size}px;height:${size}px;--dial-color:var(--status-${band.status})"
       role="img" aria-label="${pct}% ${caption}. Assessed as ${esc(band.label)}.">
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <circle class="chance-dial__track" cx="80" cy="80" r="${r}"/>
      <circle class="chance-dial__fill" cx="80" cy="80" r="${r}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
    </svg>
    <div class="chance-dial__center">
      <span class="chance-dial__pct">${pct}<span style="font-size:.45em">%</span></span>
      <span class="chance-dial__cap">${esc(caption)}</span>
    </div>
  </div>`;
}

/** A single ratio against a limit. The unfilled track is a lighter step of the same ramp. */
export function meter(value, { max = 100, status = null, leftLabel = '', rightLabel = '', label = '' } = {}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const cls = status ? ` meter--${status}` : '';
  return `
  <div class="meter${cls}">
    ${label ? `<div class="row row--between small muted" style="margin-bottom:.35rem"><span>${esc(label)}</span></div>` : ''}
    <div class="meter__track" role="img" aria-label="${esc(label || 'value')}: ${Math.round(pct)}%">
      <div class="meter__fill" style="width:${pct}%"></div>
    </div>
    ${leftLabel || rightLabel
      ? `<div class="meter__legend"><span>${esc(leftLabel)}</span><span>${esc(rightLabel)}</span></div>`
      : ''}
  </div>`;
}

/**
 * Magnitude across nominal categories (quality-of-life dimensions).
 * One hue for every bar — bar length already encodes the value, so spending the
 * identity channel on it would re-encode what length shows.
 */
export function scoreBars(items) {
  return `<div class="score-bars">${items.map(item => `
    <div class="score-bar">
      <span class="score-bar__label">${esc(item.label)}</span>
      <div class="score-bar__track">
        <div class="score-bar__fill" style="width:${Math.max(2, Math.min(100, item.value))}%"></div>
      </div>
      <span class="score-bar__value tnum">${Math.round(item.value)}</span>
    </div>`).join('')}</div>`;
}

/**
 * Part-to-whole stacked bar with a legend carrying the values.
 * Values are shown directly in the legend (not inside the segments, where they
 * would not fit) — that is the required relief for the light-surface contrast.
 * A table view is offered alongside for the same reason.
 */
export function stackedBar(segments, { currency = 'USD', id = 'cost' } = {}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const bar = segments.map((s, i) => `
    <div class="cost-bar__seg" data-series="${i + 1}" style="flex-grow:${s.value}"
         data-tip="<b>${esc(s.label)}</b><br>${money(s.value, currency)} · ${percent(s.value / total, 0)}"></div>`).join('');

  const legend = segments.map((s, i) => `
    <span class="legend__item">
      <span class="legend__swatch" data-series="${i + 1}"></span>
      ${esc(s.label)} <span class="legend__value">${money(s.value, currency)}</span>
    </span>`).join('');

  const rows = segments.map(s => `
    <tr><td>${esc(s.label)}</td><td class="num tnum">${money(s.value, currency)}</td>
    <td class="num tnum">${percent(s.value / total, 0)}</td></tr>`).join('');

  return `
  <figure style="margin:0">
    <div class="cost-bar" role="img"
         aria-label="Cost breakdown: ${segments.map(s => `${s.label} ${money(s.value, currency)}`).join(', ')}">${bar}</div>
    <figcaption class="legend">${legend}</figcaption>
    <details style="margin-top:.75rem">
      <summary class="small muted" style="cursor:pointer">View as a table</summary>
      <div class="table-wrap" style="margin-top:.5rem">
        <table class="table" id="${id}-table">
          <thead><tr><th>Item</th><th class="num">Per year</th><th class="num">Share</th></tr></thead>
          <tbody>${rows}
            <tr><td><b>Total</b></td><td class="num tnum"><b>${money(total, currency)}</b></td><td class="num tnum">100%</td></tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>`;
}

/** Label + value + optional note. Not a chart — the right form for one number. */
export function stat(label, value, note = '', { tip = '' } = {}) {
  const tipAttr = tip ? ` data-tip="${esc(tip)}"` : '';
  return `
  <div class="stat"${tipAttr}>
    <span class="stat__label">${esc(label)}</span>
    <span class="stat__value">${value}</span>
    ${note ? `<span class="stat__note">${esc(note)}</span>` : ''}
  </div>`;
}

/** Where one value sits within the full range of the dataset. */
export function positionBar(value, min, max, { lowLabel = '', highLabel = '', valueLabel = '' } = {}) {
  const pct = max === min ? 50 : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return `
  <div class="meter">
    <div class="meter__track" role="img" aria-label="${esc(valueLabel)}">
      <div class="meter__fill" style="width:${pct}%;background:var(--seq-400)"></div>
    </div>
    <div class="meter__legend"><span>${esc(lowLabel)}</span><span>${esc(highLabel)}</span></div>
  </div>`;
}
