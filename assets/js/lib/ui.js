/**
 * Shared page chrome: header, footer, theme, nav, toasts, tooltips.
 * Every page calls initChrome() once.
 */
import { getProfile, onProfileChange, COMPARE_LIMIT } from './profile.js';

const THEME_KEY = 'youruni.theme';

export const NAV = [
  { href: 'explore.html',      label: 'Explore' },
  { href: 'chances.html',      label: 'Your chances' },
  { href: 'scholarships.html', label: 'Scholarships' },
  { href: 'compare.html',      label: 'Compare' }
];

const icons = {
  sun:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></svg>',
  chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  pin:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M6 8h12M4 13l2.5-5L9 13a2.5 2.5 0 0 1-5 0ZM15 13l2.5-5L20 13a2.5 2.5 0 0 1-5 0Z"/></svg>'
};

export function icon(name) { return icons[name] || ''; }

// ------------------------------------------------------------------- theme
export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}

export function setTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  applyTheme(theme);
}

export function applyTheme(theme = getTheme()) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

function resolvedTheme() {
  const t = getTheme();
  if (t !== 'system') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function cycleTheme() {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  updateThemeButton();
  toast(`${next === 'dark' ? 'Dark' : 'Light'} theme`);
}

function updateThemeButton() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  const dark = resolvedTheme() === 'dark';
  btn.innerHTML = dark ? icons.sun : icons.moon;
  btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

// ------------------------------------------------------------------ chrome
function headerHTML(current) {
  const links = NAV.map(n => {
    const active = current === n.href ? ' aria-current="page"' : '';
    return `<a href="${n.href}"${active}>${n.label}</a>`;
  }).join('');

  return `
  <div class="container container--wide site-header__inner">
    <a class="brand-mark" href="index.html" aria-label="YourUni home">
      <span class="brand-mark__glyph" aria-hidden="true">YU</span>
      <span class="brand-mark__word">Your<b>Uni</b></span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="Main">${links}</nav>
    <div class="header-actions">
      <button class="icon-btn" data-theme-toggle type="button" aria-label="Switch theme"></button>
      <a class="btn btn--primary btn--sm" href="profile.html" aria-label="Your profile">
        ${icons.user}<span class="header-cta-text">Your profile</span>
      </a>
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false"
              aria-controls="site-nav" aria-label="Open menu" data-nav-toggle>${icons.menu}</button>
    </div>
  </div>`;
}

function footerHTML() {
  return `
  <div class="container container--wide">
    <div class="site-footer__grid">
      <div>
        <a class="brand-mark" href="index.html" style="margin-bottom:.75rem">
          <span class="brand-mark__glyph" aria-hidden="true">YU</span>
          <span class="brand-mark__word">Your<b>Uni</b></span>
        </a>
        <p class="small muted" style="max-width:34ch">
          University search built for students applying from anywhere. No account, no tracking —
          everything you enter stays in your browser.
        </p>
      </div>
      <div>
        <h4>Find</h4>
        <ul>
          <li><a href="explore.html">All universities</a></li>
          <li><a href="explore.html#fields">By subject</a></li>
          <li><a href="explore.html#countries">By country</a></li>
          <li><a href="scholarships.html">Scholarships</a></li>
        </ul>
      </div>
      <div>
        <h4>Plan</h4>
        <ul>
          <li><a href="profile.html">Your profile</a></li>
          <li><a href="chances.html">Admission chances</a></li>
          <li><a href="chances.html#improve">Improve your odds</a></li>
          <li><a href="compare.html">Compare universities</a></li>
        </ul>
      </div>
      <div>
        <h4>About the data</h4>
        <ul>
          <li><a href="about.html">Where the numbers come from</a></li>
          <li><a href="about.html#method">How chances are calculated</a></li>
          <li><a href="about.html#privacy">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__base">
      <span>Figures are approximations compiled from public sources — always confirm with the university before you apply.</span>
      <span>Built for students, not for advertisers.</span>
    </div>
  </div>`;
}

// ------------------------------------------------------------------ toasts
let toastHost;
export function toast(message, ms = 2400) {
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className = 'toast-host';
    toastHost.setAttribute('role', 'status');
    toastHost.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastHost);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastHost.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  }, ms);
}

// ----------------------------------------------------------------- tooltips
let tipEl;
export function initTooltips(root = document) {
  if (!tipEl) {
    tipEl = document.createElement('div');
    tipEl.className = 'tip';
    tipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tipEl);
  }
  const show = e => {
    const target = e.target.closest('[data-tip]');
    if (!target) return;
    tipEl.innerHTML = target.dataset.tip;
    tipEl.classList.add('is-visible');
    position(target);
  };
  const position = target => {
    const r = target.getBoundingClientRect();
    const t = tipEl.getBoundingClientRect();
    let left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(8, Math.min(window.innerWidth - t.width - 8, left));
    let top = r.top - t.height - 8;
    if (top < 8) top = r.bottom + 8;
    tipEl.style.left = `${left}px`;
    tipEl.style.top = `${top}px`;
  };
  const hide = () => tipEl.classList.remove('is-visible');

  root.addEventListener('pointerover', show);
  root.addEventListener('pointerout', e => { if (e.target.closest('[data-tip]')) hide(); });
  root.addEventListener('focusin', show);
  root.addEventListener('focusout', hide);
  window.addEventListener('scroll', hide, { passive: true });
}

// ------------------------------------------------------------ scroll reveal
export function initReveal(root = document) {
  const items = root.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const delay = Math.min(i * 45, 220);
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '120px 0px 120px 0px', threshold: 0.01 });
  items.forEach(el => io.observe(el));

  // Failsafe: content must never stay invisible because an observer did not fire
  // (print, full-page capture, a browser that throttles callbacks off-screen).
  setTimeout(() => items.forEach(el => el.classList.add('is-visible')), 1500);
}

// --------------------------------------------------------------- init all
export function initChrome({ current = '' } = {}) {
  applyTheme();

  const header = document.querySelector('.site-header');
  if (header) header.innerHTML = headerHTML(current);
  const footer = document.querySelector('.site-footer');
  if (footer) footer.innerHTML = footerHTML();

  updateThemeButton();
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', cycleTheme);

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = open ? icons.close : icons.menu;
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('is-open') && !e.target.closest('#site-nav') && !e.target.closest('[data-nav-toggle]')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = icons.menu;
    }
  });

  // Header gains a hairline once the page scrolls.
  const onScroll = () => header?.classList.toggle('is-stuck', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeButton);

  updateCompareBadge();
  onProfileChange(updateCompareBadge);

  initTooltips();
  initReveal();
}

function updateCompareBadge() {
  const p = getProfile();
  document.querySelectorAll('[data-compare-count]').forEach(el => {
    el.textContent = p.compare.length ? `${p.compare.length}/${COMPARE_LIMIT}` : '';
    el.hidden = p.compare.length === 0;
  });
}

/** Read the current page's query string. */
export function query(name) {
  return new URLSearchParams(location.search).get(name);
}
