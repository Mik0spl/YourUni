/**
 * Grade conversion engine.
 *
 * Every grading system maps onto one shared 0–100 academic index. Converting
 * between two systems always goes through it, so adding a system to
 * data/reference/grade-systems.js needs no code change here.
 */
import {
  gradeSystems, gradeSystemById,
  admissionTests, admissionTestById,
  englishTests, englishTestById
} from '../../../data/reference/grade-systems.js';

export { gradeSystems, gradeSystemById, admissionTests, admissionTestById, englishTests, englishTestById };

/** Piecewise-linear lookup: raw value -> index. Clamps outside the anchor range. */
function anchorsToIndex(anchors, raw) {
  const v = Number(raw);
  if (!Number.isFinite(v)) return null;
  if (v <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (v >= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (v >= x0 && v <= x1) {
      const t = x1 === x0 ? 0 : (v - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

/** Inverse lookup: index -> raw value. Handles anchors whose index descends. */
function indexToAnchors(anchors, index) {
  const target = Number(index);
  if (!Number.isFinite(target)) return null;

  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    const lo = Math.min(y0, y1);
    const hi = Math.max(y0, y1);
    if (target >= lo && target <= hi) {
      const t = y1 === y0 ? 0 : (target - y0) / (y1 - y0);
      return x0 + t * (x1 - x0);
    }
  }
  // Outside the covered range: clamp to whichever end is nearer.
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  const distFirst = Math.abs(target - first[1]);
  const distLast = Math.abs(target - last[1]);
  return distFirst < distLast ? first[0] : last[0];
}

/** Convert a value in any grading system to the shared 0–100 academic index. */
export function toIndex(systemId, value) {
  const sys = gradeSystemById[systemId];
  if (!sys || value === '' || value == null) return null;

  if (sys.kind === 'choice') {
    const opt = sys.options.find(o => o.value === value);
    return opt ? opt.index : null;
  }
  return anchorsToIndex(sys.anchors, value);
}

/** Convert an academic index back into a value in a given system. */
export function fromIndex(systemId, index) {
  const sys = gradeSystemById[systemId];
  if (!sys || index == null) return null;

  if (sys.kind === 'choice') {
    // Pick the option whose index is closest to the target.
    let best = sys.options[0];
    for (const o of sys.options) {
      if (Math.abs(o.index - index) < Math.abs(best.index - index)) best = o;
    }
    return best.value;
  }

  const raw = indexToAnchors(sys.anchors, index);
  if (raw == null) return null;
  const step = sys.step || 1;
  const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0;
  const rounded = Number(raw.toFixed(decimals));
  return Math.min(sys.max ?? rounded, Math.max(sys.min ?? rounded, rounded));
}

/** Format a raw value the way its own system writes it. */
export function formatGrade(systemId, value) {
  const sys = gradeSystemById[systemId];
  if (!sys || value == null) return '—';
  try {
    return sys.format ? sys.format(value) : String(value);
  } catch {
    return String(value);
  }
}

/** Convert one grade into every other supported system. */
export function convertToAllSystems(systemId, value) {
  const index = toIndex(systemId, value);
  if (index == null) return [];
  return gradeSystems
    .filter(s => s.id !== systemId)
    .map(s => {
      const raw = fromIndex(s.id, index);
      return { id: s.id, label: s.label, short: s.short, region: s.region, raw, display: formatGrade(s.id, raw) };
    });
}

/** SAT/ACT score -> academic index contribution. */
export function testToIndex(testId, score) {
  const t = admissionTestById[testId];
  if (!t || score == null || score === '') return null;
  return anchorsToIndex(t.anchors, score);
}

/** English test score -> shared 0–100 english index. */
export function englishToIndex(testId, score) {
  const t = englishTestById[testId];
  if (!t || score == null || score === '') return null;
  return anchorsToIndex(t.anchors, score);
}

/** Shared english index -> a score in a given English test. */
export function englishFromIndex(testId, index) {
  const t = englishTestById[testId];
  if (!t || index == null) return null;
  const raw = indexToAnchors(t.anchors, index);
  if (raw == null) return null;
  const step = t.step || 1;
  const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0;
  return Number((Math.round(raw / step) * step).toFixed(decimals));
}

/**
 * The academic index a university effectively requires, derived from whichever
 * of its published requirements are available and averaged for robustness.
 */
export function requirementIndex(uni) {
  const parts = [];
  if (uni.req?.ib != null) parts.push(toIndex('ib', uni.req.ib));
  if (uni.req?.alevel) parts.push(toIndex('alevel', uni.req.alevel));
  if (uni.req?.gpa != null) parts.push(toIndex('gpa4', uni.req.gpa));
  const valid = parts.filter(p => p != null);
  if (!valid.length) return 60;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

/** The english index a university requires, from its IELTS/TOEFL minimums. */
export function englishRequirementIndex(uni) {
  const parts = [];
  if (uni.req?.ielts != null) parts.push(englishToIndex('ielts', uni.req.ielts));
  if (uni.req?.toefl != null) parts.push(englishToIndex('toefl', uni.req.toefl));
  const valid = parts.filter(p => p != null);
  if (!valid.length) return null;
  // A university that accepts "IELTS 6.5 or TOEFL 90" is satisfied by either, so
  // the requirement is the easier of the two routes, not the harder one.
  return Math.min(...valid);
}
