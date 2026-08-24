/**
 * Admission probability model.
 *
 * The headline acceptance rate is the starting point, then the profile moves it:
 * how far your grades sit above or below what the university asks for, whether
 * your tests and English clear the bar, how much your activities count *in that
 * country's admissions culture*, and whether your intended field is one of its
 * strengths.
 *
 * This is an estimate built on published figures, not a prediction. It is useful
 * for sorting a hundred universities into "realistic" and "not", which is exactly
 * what it is used for here.
 */
import { toIndex, fromIndex, testToIndex, englishToIndex } from './grades.js';
import { activityById } from '../../../data/reference/activities.js';
import { NATIVE_ENGLISH_INDEX } from '../../../data/reference/grade-systems.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const logit = p => Math.log(p / (1 - p));
const sigmoid = z => 1 / (1 + Math.exp(-z));

/** Diminishing weights: your best activity counts fully, the fifth barely. */
const ACTIVITY_WEIGHTS = [1, 0.8, 0.6, 0.45, 0.3, 0.2, 0.12, 0.08];
const ACTIVITY_NORMALISER = 22;

/**
 * Score the profile's activities 0–1, before any country weighting.
 * Activities relevant to the intended field count for 25% more.
 */
export function activityScore(profile) {
  const chosen = (profile.activities || []).map(id => activityById[id]).filter(Boolean);
  if (!chosen.length) return 0;

  const wantedFields = profile.fields || [];
  const scored = chosen.map(a => {
    const relevant = a.bestFor !== 'all' && a.bestFor.some(f => wantedFields.includes(f));
    return a.impact * (relevant ? 1.25 : 1);
  }).sort((a, b) => b - a);

  let total = 0;
  scored.forEach((value, i) => { total += value * (ACTIVITY_WEIGHTS[i] ?? 0.05); });
  return clamp(total / ACTIVITY_NORMALISER, 0, 1);
}

/** The profile's academic index, blending grades with test scores where they count. */
export function academicIndex(profile, uni = null) {
  const base = toIndex(profile.gradeSystem, profile.grade);
  if (base == null) return null;

  const usesTests = !uni || ['required', 'optional', 'flexible', 'accepted'].includes(uni.admissions?.testPolicy);
  if (!usesTests) return base;

  const scores = [testToIndex('sat', profile.tests?.sat), testToIndex('act', profile.tests?.act)]
    .filter(v => v != null);
  if (!scores.length) return base;

  // A strong test nudges the index up; a weak one pulls it down, but less.
  const best = Math.max(...scores);
  const gap = best - base;
  return clamp(base + (gap > 0 ? gap * 0.30 : gap * 0.15), 0, 100);
}

export function englishIndexOf(profile) {
  if (profile.english?.native) return NATIVE_ENGLISH_INDEX;
  return englishToIndex(profile.english?.test, profile.english?.score);
}

export const BANDS = {
  likely:     { id: 'likely',     label: 'Likely',      status: 'good',
                blurb: 'Your profile is comfortably above what this university asks for.' },
  target:     { id: 'target',     label: 'Target',      status: 'warning',
                blurb: 'A realistic match — you are in the range they admit from.' },
  reach:      { id: 'reach',      label: 'Reach',       status: 'serious',
                blurb: 'Possible, but you would need the rest of the application to carry weight.' },
  'far-reach':{ id: 'far-reach',  label: 'Far reach',   status: 'critical',
                blurb: 'A long shot. Worth one application if you love it, not five.' }
};

export function bandFor(probability) {
  if (probability >= 0.60) return BANDS.likely;
  if (probability >= 0.30) return BANDS.target;
  if (probability >= 0.12) return BANDS.reach;
  return BANDS['far-reach'];
}

/** Core calculation, factored out so `improvements` can re-run it cheaply. */
function probabilityFor(uni, profile) {
  const index = academicIndex(profile, uni);
  if (index == null) return null;

  const base = clamp(uni.intlAcceptance ?? uni.acceptance, 0.01, 0.95);
  let z = logit(base);

  // 1. Academic distance from the published requirement.
  const delta = index - uni.requiredIndex;
  z += delta >= 0 ? delta * 0.115 : delta * 0.135;

  // 2. Test scores, where the university actually reads them.
  const policy = uni.admissions?.testPolicy;
  if (policy === 'required' || policy === 'optional' || policy === 'flexible') {
    const sat = testToIndex('sat', profile.tests?.sat);
    const act = testToIndex('act', profile.tests?.act);
    const best = Math.max(sat ?? -1, act ?? -1);
    if (best >= 0) {
      const target = testToIndex('sat', uni.req?.sat) ?? uni.requiredIndex;
      z += clamp((best - target) * 0.03, -0.4, 0.45);
    } else if (policy === 'required') {
      z -= 0.8; // a required test that is missing is a real problem
    }
  }

  // 3. Activities, weighted by how much this country's system reads them.
  const ec = activityScore(profile);
  z += ec * (uni.culture?.weight ?? 0.3) * 2.2;

  // 4. Subject fit.
  const wanted = profile.fields || [];
  if (wanted.length) {
    if (wanted.some(f => uni.strongFields?.includes(f))) z += 0.22;
    else if (wanted.some(f => uni.fields.includes(f))) z += 0.08;
    else z -= 0.35; // they do not really teach what you want
  }

  // 5. English proficiency: a gate, not a bonus.
  const english = englishIndexOf(profile);
  if (uni.englishIndex != null && english != null) {
    const shortfall = uni.englishIndex - english;
    if (shortfall > 0) z -= clamp(shortfall * 0.12, 0, 2.6);
  }

  return clamp(sigmoid(z), 0.01, 0.97);
}

/**
 * Full assessment for one university.
 * Returns null when the profile has no grades yet.
 */
export function assess(uni, profile) {
  const probability = probabilityFor(uni, profile);
  if (probability == null) return null;

  const index = academicIndex(profile, uni);
  const english = englishIndexOf(profile);
  const gradeGap = index - uni.requiredIndex;

  const blockers = [];
  if (uni.englishIndex != null && english != null && english < uni.englishIndex) {
    blockers.push({
      id: 'english',
      label: 'English score below the minimum',
      detail: `This university requires roughly IELTS ${uni.req?.ielts ?? '—'} / TOEFL ${uni.req?.toefl ?? '—'}. Applications below the minimum are usually rejected before they are read.`
    });
  }
  if (uni.englishIndex != null && english == null && !profile.english?.native) {
    blockers.push({
      id: 'english-missing',
      label: 'No English test recorded',
      detail: `You will need around IELTS ${uni.req?.ielts ?? '—'} / TOEFL ${uni.req?.toefl ?? '—'} to apply here.`
    });
  }
  if (uni.admissions?.testPolicy === 'required' && !profile.tests?.sat && !profile.tests?.act
      && ['US'].includes(uni.country)) {
    blockers.push({
      id: 'test-missing',
      label: 'SAT or ACT required',
      detail: 'This university still requires a standardised test score from every applicant.'
    });
  }
  const wanted = profile.fields || [];
  if (wanted.length && !wanted.some(f => uni.fields.includes(f))) {
    blockers.push({
      id: 'field',
      label: 'Does not offer your field',
      detail: 'None of the subjects you picked are taught here at undergraduate level.'
    });
  }

  return {
    probability,
    band: bandFor(probability),
    index,
    requiredIndex: uni.requiredIndex,
    gradeGap,
    englishIndex: english,
    activityScore: activityScore(profile),
    culture: uni.culture,
    blockers,
    improvements: improvements(uni, profile, probability)
  };
}

/**
 * What would actually move the needle, measured by re-running the model.
 * Only changes that help are returned, biggest gain first.
 */
export function improvements(uni, profile, current = null) {
  const now = current ?? probabilityFor(uni, profile);
  if (now == null) return [];

  const candidates = [];
  const push = (id, label, description, mutate) => {
    const p = probabilityFor(uni, mutate(structuredClone(profile)));
    if (p == null || p <= now) return;
    const delta = p - now;
    // `meaningful` lets the UI distinguish "this genuinely helps" from
    // "nothing on this list rescues an application that is out of range".
    candidates.push({ id, label, description, delta, to: p, meaningful: delta >= 0.01 });
  };

  // Grades: one meaningful band up (roughly IB +2, or one A-Level grade).
  push('grades', 'Raise your predicted grades one band',
    'Worth more than anything else on this list at almost every university. Grades are the one factor every admissions system reads.',
    p => {
      const target = (toIndex(p.gradeSystem, p.grade) ?? 0) + 4.5;
      // Re-express the higher index back in the student's own system.
      const sys = p.gradeSystem;
      const better = fromIndex(sys, target);
      if (better != null) p.grade = better;
      return p;
    });

  // English: reach the university's stated minimum.
  const english = englishIndexOf(profile);
  if (uni.englishIndex != null && (english == null || english < uni.englishIndex)) {
    push('english', `Reach IELTS ${uni.req?.ielts ?? '—'} / TOEFL ${uni.req?.toefl ?? '—'}`,
      'This is a hard gate rather than a bonus — clearing it unlocks the application, and going far past it adds nothing.',
      p => {
        p.english = { ...p.english, native: false, test: 'ielts', score: uni.req?.ielts ?? 7 };
        return p;
      });
  }

  // Tests, where they are read.
  const policy = uni.admissions?.testPolicy;
  if (['required', 'optional', 'flexible'].includes(policy) && uni.req?.sat) {
    const currentSat = Number(profile.tests?.sat) || 0;
    if (currentSat < uni.req.sat) {
      push('sat', `Score ${uni.req.sat}+ on the SAT`,
        `Their typical admitted score. ${policy === 'optional' ? 'Optional here, but a score at or above their range still helps.' : 'Required for this university.'}`,
        p => { p.tests = { ...p.tests, sat: uni.req.sat }; return p; });
    }
  }

  // Activities — only suggest ones the student does not already have.
  const have = new Set(profile.activities || []);
  const cultureWeight = uni.culture?.weight ?? 0.3;
  if (cultureWeight >= 0.3) {
    if (!have.has('national-olympiad') && !have.has('intl-olympiad')) {
      push('olympiad', 'Reach a national subject olympiad final',
        'The most respected achievement a school student can realistically obtain, and it reads as evidence of genuine subject ability rather than effort.',
        p => { p.activities = [...(p.activities || []), 'national-olympiad']; return p; });
    }
    if (!have.has('research-assistant') && !have.has('published-research')) {
      push('research', 'Take on a research placement',
        'Sustained work in a lab or with an academic, even unpaid. Universities read this as proof you know what the subject actually involves.',
        p => { p.activities = [...(p.activities || []), 'research-assistant']; return p; });
    }
    if (!have.has('built-organisation') && !have.has('sustained-leadership')) {
      push('leadership', 'Build something that outlasts you',
        'A programme, team or publication that kept running after you handed it over. Depth over a list of titles.',
        p => { p.activities = [...(p.activities || []), 'built-organisation']; return p; });
    }
  }

  return candidates.sort((a, b) => b.delta - a.delta).slice(0, 5);
}

/** Assess every university at once and bucket them. */
export function assessAll(universities, profile) {
  const results = universities
    .map(uni => ({ uni, result: assess(uni, profile) }))
    .filter(r => r.result)
    .sort((a, b) => b.result.probability - a.result.probability);

  return {
    all: results,
    likely: results.filter(r => r.result.band.id === 'likely'),
    target: results.filter(r => r.result.band.id === 'target'),
    reach: results.filter(r => r.result.band.id === 'reach'),
    farReach: results.filter(r => r.result.band.id === 'far-reach')
  };
}
