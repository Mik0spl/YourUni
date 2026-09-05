/**
 * Grading systems and their conversion anchors.
 *
 * Every system maps onto one shared 0–100 **academic index**, which is what the
 * rest of the site compares against. Converting Abitur → IB therefore means
 * Abitur → index → IB, so adding a new system never touches the others.
 *
 * anchors: [rawValue, index] pairs, sorted by rawValue ascending.
 *          The index may run downwards (Abitur, where 1.0 is the best grade) —
 *          the interpolator handles both directions.
 *
 * TO ADD A SYSTEM: append an entry here. Nothing else needs to change.
 *
 * Index landmarks used to keep systems consistent with each other:
 *   99  top ~0.5% of applicants      86  IB 38 / AAA
 *   95  IB 42 / A*A*A                80  IB 36 / AAB
 *   91  IB 40 / A*AA                 68  IB 32 / BBB
 */
export const gradeSystems = [
  {
    id: 'ib', label: 'IB Diploma', short: 'IB', region: 'International',
    kind: 'numeric', unit: 'points', min: 24, max: 45, step: 1, placeholder: '38',
    better: 'higher',
    note: 'Total points across six subjects plus the core (TOK/EE bonus).',
    anchors: [[24, 40], [25, 45], [28, 55], [30, 62], [32, 68], [34, 74], [36, 80],
              [38, 86], [40, 91], [42, 95], [43, 96.5], [44, 98], [45, 99.5]],
    format: v => `${Math.round(v)} points`
  },
  {
    id: 'alevel', label: 'A-Levels', short: 'A-Level', region: 'United Kingdom',
    kind: 'choice', unit: 'grades', placeholder: 'AAA',
    better: 'higher',
    note: 'Your three strongest A-Level grades, best first.',
    options: [
      { value: 'A*A*A*', index: 99 }, { value: 'A*A*A', index: 96 },
      { value: 'A*AA', index: 92 },   { value: 'AAA', index: 87 },
      { value: 'AAB', index: 82 },    { value: 'ABB', index: 76 },
      { value: 'BBB', index: 70 },    { value: 'BBC', index: 64 },
      { value: 'BCC', index: 58 },    { value: 'CCC', index: 51 },
      { value: 'CCD', index: 45 },    { value: 'CDD', index: 39 },
      { value: 'DDD', index: 33 }
    ],
    format: v => String(v)
  },
  {
    id: 'gpa4', label: 'US GPA (unweighted 4.0)', short: 'GPA', region: 'United States',
    kind: 'numeric', unit: '/ 4.0', min: 2, max: 4, step: 0.01, placeholder: '3.8',
    better: 'higher',
    note: 'An unweighted GPA cannot show course rigour, so it tops out slightly below a perfect index — AP/IB course load and test scores carry the rest.',
    anchors: [[2.0, 36], [2.5, 46], [2.7, 51], [3.0, 59], [3.3, 68], [3.5, 74],
              [3.6, 78], [3.7, 82], [3.8, 86], [3.9, 91], [3.95, 94], [4.0, 96]],
    format: v => v.toFixed(2)
  },
  {
    id: 'eu10', label: '10-point scale', short: '/10', region: 'Netherlands · Spain · Portugal',
    kind: 'numeric', unit: '/ 10', min: 5, max: 10, step: 0.1, placeholder: '8.0',
    better: 'higher',
    note: 'Dutch, Spanish and Portuguese school averages. A 9 is genuinely exceptional; a 10 is close to unheard of.',
    anchors: [[5.0, 34], [5.5, 42], [6.0, 48], [6.5, 54], [7.0, 62], [7.5, 69],
              [8.0, 78], [8.5, 86], [9.0, 93], [9.5, 97], [10, 99.5]],
    format: v => v.toFixed(1)
  },
  {
    id: 'fr20', label: '20-point scale', short: '/20', region: 'France · Belgium · Lebanon',
    kind: 'numeric', unit: '/ 20', min: 8, max: 20, step: 0.1, placeholder: '15.0',
    better: 'higher',
    note: 'French Baccalauréat average (moyenne générale). Mention Très Bien starts at 16.',
    anchors: [[8, 32], [10, 42], [11, 50], [12, 58], [13, 66], [14, 74], [15, 81],
              [16, 88], [17, 93], [18, 96.5], [19, 98.5], [20, 99.8]],
    format: v => v.toFixed(1)
  },
  {
    id: 'abitur', label: 'German Abitur', short: 'Abitur', region: 'Germany',
    kind: 'numeric', unit: 'Note', min: 1, max: 4, step: 0.1, placeholder: '1.7',
    better: 'lower',
    note: 'The Abiturnote runs the other way: 1.0 is the best possible result and 4.0 is the pass mark.',
    anchors: [[1.0, 99], [1.1, 97.5], [1.3, 95], [1.5, 92], [1.7, 88], [2.0, 82],
              [2.3, 76], [2.5, 71], [2.7, 66], [3.0, 58], [3.3, 51], [3.5, 47], [4.0, 38]],
    format: v => v.toFixed(1)
  },
  {
    id: 'maturita', label: 'Italian Maturità', short: 'Maturità', region: 'Italy',
    kind: 'numeric', unit: '/ 100', min: 60, max: 100, step: 1, placeholder: '90',
    better: 'higher',
    note: 'Esame di Stato final mark. 100 e lode is the top result.',
    anchors: [[60, 40], [65, 46], [70, 53], [75, 60], [80, 68], [85, 76],
              [90, 84], [95, 92], [98, 96], [100, 99]],
    format: v => `${Math.round(v)}/100`
  },
  {
    id: 'matura_pl', label: 'Polish Matura', short: 'Matura', region: 'Poland',
    kind: 'numeric', unit: '% extended', min: 20, max: 100, step: 1, placeholder: '80',
    better: 'higher',
    note: 'Average percentage across your extended-level (rozszerzenie) subjects.',
    anchors: [[20, 32], [30, 38], [40, 46], [50, 55], [60, 64], [70, 73],
              [80, 82], [85, 87], [90, 92], [95, 96], [100, 99]],
    format: v => `${Math.round(v)}%`
  },
  {
    id: 'cbse', label: 'Indian CBSE / ISC', short: 'CBSE', region: 'India',
    kind: 'numeric', unit: '%', min: 50, max: 100, step: 0.5, placeholder: '92',
    better: 'higher',
    note: 'Best-of-five percentage in Class XII board exams.',
    anchors: [[50, 34], [60, 42], [70, 52], [75, 58], [80, 65], [85, 73],
              [90, 82], [93, 87], [95, 91], [97, 95], [99, 98], [100, 99.5]],
    format: v => `${v}%`
  },
  {
    id: 'gaokao', label: 'Chinese Gaokao', short: 'Gaokao', region: 'China',
    kind: 'numeric', unit: '/ 750', min: 350, max: 750, step: 1, placeholder: '620',
    better: 'higher',
    note: 'Total score. Provincial cut-offs vary, so treat this as an approximation.',
    anchors: [[350, 34], [400, 40], [450, 48], [500, 57], [550, 66], [580, 72],
              [600, 78], [630, 85], [650, 90], [680, 95], [700, 98], [750, 99.9]],
    format: v => `${Math.round(v)}/750`
  },
  {
    id: 'atar', label: 'Australian ATAR', short: 'ATAR', region: 'Australia',
    kind: 'numeric', unit: 'ATAR', min: 50, max: 99.95, step: 0.05, placeholder: '95.00',
    better: 'higher',
    note: 'A percentile rank, not a mark — 90 means you finished ahead of 90% of your cohort.',
    anchors: [[50, 34], [60, 42], [70, 52], [80, 64], [85, 71], [90, 79],
              [93, 85], [95, 89], [97, 93], [99, 97], [99.5, 98.5], [99.95, 99.9]],
    format: v => v.toFixed(2)
  },
  {
    id: 'ca_percent', label: 'Canadian percentage', short: 'CA %', region: 'Canada',
    kind: 'numeric', unit: '%', min: 55, max: 100, step: 0.5, placeholder: '90',
    better: 'higher',
    note: 'Average of your top six Grade 12 courses.',
    anchors: [[55, 34], [60, 38], [70, 48], [75, 55], [80, 63], [85, 72],
              [88, 78], [90, 82], [93, 88], [95, 92], [97, 96], [100, 99]],
    format: v => `${v}%`
  },
  {
    id: 'ch6', label: 'Swiss Maturité', short: '/6', region: 'Switzerland · Austria',
    kind: 'numeric', unit: '/ 6', min: 4, max: 6, step: 0.1, placeholder: '5.2',
    better: 'higher',
    note: '4.0 is the pass mark and 6.0 the maximum. Anything above 5.5 is strong.',
    anchors: [[4.0, 42], [4.5, 53], [5.0, 66], [5.3, 74], [5.5, 80], [5.8, 89], [6.0, 97]],
    format: v => v.toFixed(1)
  },
  {
    id: 'ege', label: 'Russian EGE', short: 'EGE', region: 'Russia · Central Asia',
    kind: 'numeric', unit: 'avg / 100', min: 40, max: 100, step: 1, placeholder: '85',
    better: 'higher',
    note: 'Average score across your three or four subject exams.',
    anchors: [[40, 32], [50, 40], [60, 50], [70, 61], [75, 68], [80, 75],
              [85, 82], [90, 89], [95, 95], [100, 99]],
    format: v => `${Math.round(v)}/100`
  },
  {
    id: 'enem', label: 'Brazilian ENEM', short: 'ENEM', region: 'Brazil',
    kind: 'numeric', unit: '/ 1000', min: 400, max: 1000, step: 1, placeholder: '750',
    better: 'higher',
    note: 'Average across the five ENEM areas including the essay.',
    anchors: [[400, 32], [500, 40], [550, 48], [600, 57], [650, 66], [700, 75],
              [750, 83], [800, 90], [850, 95], [900, 98], [1000, 99.9]],
    format: v => `${Math.round(v)}/1000`
  },
  {
    id: 'percent', label: 'Percentage (generic)', short: '%', region: 'Any',
    kind: 'numeric', unit: '%', min: 40, max: 100, step: 0.5, placeholder: '85',
    better: 'higher',
    note: 'Use this if your system is not listed — enter your overall school average as a percentage.',
    anchors: [[40, 30], [50, 38], [60, 46], [70, 56], [80, 67], [85, 74],
              [90, 82], [95, 91], [98, 96], [100, 99]],
    format: v => `${v}%`
  }
];

export const gradeSystemById = Object.fromEntries(gradeSystems.map(s => [s.id, s]));

/**
 * Admissions tests that contribute to the academic index (US-style).
 */
export const admissionTests = [
  {
    id: 'sat', label: 'SAT', min: 400, max: 1600, step: 10, placeholder: '1450',
    note: 'Digital SAT total score, Reading & Writing plus Math.',
    anchors: [[400, 10], [900, 32], [1000, 40], [1100, 50], [1200, 60], [1300, 71],
              [1400, 82], [1450, 87], [1500, 92], [1550, 96], [1600, 99]]
  },
  {
    id: 'act', label: 'ACT', min: 1, max: 36, step: 1, placeholder: '33',
    note: 'ACT composite score.',
    anchors: [[15, 20], [18, 32], [20, 42], [23, 52], [26, 63], [29, 74],
              [31, 82], [33, 89], [34, 92], [35, 96], [36, 99]]
  }
];

export const admissionTestById = Object.fromEntries(admissionTests.map(t => [t.id, t]));

/**
 * English-proficiency tests. These are a separate gate — they do not raise your
 * academic index, but falling below a university's minimum blocks the application
 * outright, so the site checks them independently.
 *
 * Anchors map each test onto a shared 0–100 english index.
 */
export const englishTests = [
  {
    id: 'ielts', label: 'IELTS Academic', min: 4, max: 9, step: 0.5, placeholder: '7.0',
    anchors: [[4.0, 20], [4.5, 28], [5.0, 38], [5.5, 48], [6.0, 58], [6.5, 68],
              [7.0, 78], [7.5, 86], [8.0, 92], [8.5, 96], [9.0, 100]],
    format: v => v.toFixed(1)
  },
  {
    id: 'toefl', label: 'TOEFL iBT', min: 30, max: 120, step: 1, placeholder: '100',
    anchors: [[30, 18], [40, 28], [50, 38], [60, 48], [72, 58], [86, 68],
              [95, 78], [105, 86], [112, 92], [116, 96], [120, 100]],
    format: v => String(Math.round(v))
  },
  {
    id: 'duolingo', label: 'Duolingo English Test', min: 40, max: 160, step: 5, placeholder: '120',
    anchors: [[55, 20], [70, 30], [80, 38], [90, 48], [100, 58], [110, 68],
              [120, 78], [130, 86], [140, 92], [150, 96], [160, 100]],
    format: v => String(Math.round(v))
  },
  {
    id: 'cae', label: 'Cambridge C1/C2', min: 140, max: 230, step: 1, placeholder: '185',
    anchors: [[140, 30], [160, 45], [169, 55], [180, 68], [185, 75], [191, 82],
              [200, 90], [210, 95], [230, 100]],
    format: v => String(Math.round(v))
  }
];

export const englishTestById = Object.fromEntries(englishTests.map(t => [t.id, t]));

/** Native/near-native speakers usually get the requirement waived entirely. */
export const NATIVE_ENGLISH_INDEX = 100;
