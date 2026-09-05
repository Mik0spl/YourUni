# The data folder

Everything the site shows lives here as plain JavaScript modules. There is no build
step and no database — adding a university means appending an object to a file.

Run `npm run validate` after any change. It checks cross-references, ranges and
required fields, and tells you exactly what is wrong before it reaches the page.

```
data/
├── validate.mjs                  the checker — run this after every edit
├── universities/
│   ├── index.js                  assembles the regional files into one list
│   ├── uk-outcomes.js            GENERATED — Discover Uni measured outcomes
│   ├── united-states.js          18 universities
│   ├── canada.js                 6
│   ├── united-kingdom-ireland.js 14
│   ├── europe-west.js            24  (NL, DE, FR, CH, BE, AT)
│   ├── europe-nordic.js          9   (SE, DK, NO, FI)
│   ├── europe-south-central.js   14  (IT, ES, PT, PL, CZ, HU, TR)
│   ├── asia.js                   17
│   └── oceania-and-rest.js       14  (AU, NZ, AE, IL, ZA, BR, MX)
├── scholarships/
│   ├── index.js
│   ├── global.js                 government and cross-border programmes
│   ├── university-awards.js      UK, Ireland and North America
│   └── university-awards-world.js  everywhere else
└── reference/
    ├── fields.js                 fields of study
    ├── countries.js              visas, work rights, cost of living, healthcare
    ├── grade-systems.js          grade conversion anchors + test scales
    ├── activities.js             extracurricular impact + admissions culture
    └── currencies.js             exchange rates used for cross-border comparison
```

---

## Adding a university

Append an object to the regional file that fits, or create a new file and import it
in `universities/index.js`. Every field below marked **required** is enforced by the
validator.

```js
{
  id: 'tudelft',                    // required · unique, lowercase, used in URLs
  name: 'Delft University of Technology',  // required · full official name
  short: 'TU Delft',                // required · what cards and tables show
  country: 'NL',                    // required · must exist in reference/countries.js
  city: 'Delft, Netherlands',       // required
  type: 'public',                   // 'public' | 'private'
  founded: 1842,
  crest: '#00A6D6',                 // required · brand colour behind the initial.
                                    //   Must be dark enough for white text on it.
  initials: 'D',                    // required · one or two characters

  rankGlobal: 47,                   // required · composite world position
  students: 27000,
  intlShare: 0.32,                  // 0–1, share of students from abroad
  acceptance: 0.55,                 // required · 0–1 decimal. 0.55 means 55%.
  intlAcceptance: 0.40,             // optional; the chance model prefers this one
  language: ['English', 'Dutch'],

  fields: ['engineering', 'architecture'],   // required · ids from reference/fields.js
  strongFields: ['engineering'],             // subset of `fields`, shown with a star

  tuition: { intl: 20000, eu: 2601, currency: 'EUR' },  // required · per year.
                                    //   `eu` is optional and only for EU/EEA rates.
  living: 12500,                    // required · per year, same currency as tuition

  req: {                            // required
    ib: 33,                         // 24–45
    alevel: 'ABB',                  // must be one of the combinations in grade-systems.js
    gpa: 3.5,                       // 0–4
    sat: null, act: null,           // null where the university does not use them
    ielts: 6.5, toefl: 90,
    subjects: ['Mathematics at the highest level', 'Physics'],
    note: 'Free text shown under the requirements table.'
  },

  admissions: {                     // required
    testPolicy: 'not-used',         // see the list below
    interview: 'none',              // true | 'none' | 'required' | free text
    essays: false,                  // true | false | free text
    portfolio: 'for architecture',  // true | false | free text
    deadlines: [{ label: 'EU applicants', date: '1 May' }],
    documents: ['Studielink registration', 'Transcript and diploma']
  },

  scholarships: ['holland-scholarship'],   // ids from data/scholarships/*

  qol: {                            // required · every key, 0–100, higher is better
    safety: 86, affordability: 52,  //   affordability: higher = money goes further
    transport: 92, culture: 78,
    nature: 66, studentLife: 84
  },
  employability: 91,                // 0–100 graduate outcomes
  website: 'https://tudelft.nl',
  blurb: 'One or two sentences with something genuinely useful in them.'
}
```

**`testPolicy` values** — `required`, `optional`, `flexible`, `accepted`,
`not-used`, `admissions-test`, `entrance-exam`, `varies`, `for medicine`.

The site derives the rest: total cost, USD conversion, the composite
quality-of-life score, and the academic index the university effectively requires.

---

## Adding a scholarship

```js
{
  id: 'holland-scholarship',        // required · unique
  name: 'Holland Scholarship',      // required
  provider: 'Dutch Ministry of Education',  // required
  scope: 'country',                 // required · 'global' | 'country' | 'university'
  country: 'NL',                    // country code, or null for global programmes
  universities: ['tudelft'],        // only for scope: 'university'
  type: 'merit',                    // required · 'merit' | 'need' | 'need-and-merit'
  coverage: 'partial',              // required · 'full' | 'partial'
  amount: { value: 5000, currency: 'EUR', period: 'first year only' },
  // …or, when it is not a single number:
  // amount: { text: 'Full tuition, accommodation and a monthly stipend' },
  eligibility: {                    // required
    minIndex: 70,                   // required · 0–100 on the academic index
    citizenship: 'non-eu',          // 'any' | 'non-eu' | 'eu' | 'developing' | ['US','CA']
    fields: null,                   // null for any, or an array of field ids
    level: 'bachelor',              // 'bachelor' | 'master' | 'postgraduate'
    needBased: false
  },
  deadline: '1 February',
  renewable: false,
  link: 'https://studyinnl.org',
  note: 'Anything a student would want to know before applying.'
}
```

---

## Adding a grading system

This is the one that makes the whole site work for a new country. Every system maps
onto a shared **0–100 academic index**; converting Abitur to IB goes Abitur → index →
IB, so a new system automatically converts to and from all the others.

```js
{
  id: 'matura_pl',
  label: 'Polish Matura',
  short: 'Matura',                  // used in the compact conversion grid
  region: 'Poland',
  kind: 'numeric',                  // 'numeric' | 'choice'
  unit: '% extended', min: 20, max: 100, step: 1, placeholder: '80',
  better: 'higher',                 // 'lower' for systems like the Abitur
  note: 'Shown as a hint under the input.',
  anchors: [[20, 32], [50, 55], [80, 82], [100, 99]],
  format: v => `${Math.round(v)}%`
}
```

`anchors` are `[yourValue, academicIndex]` pairs **sorted by value ascending**. The
index may run downwards — that is how the Abitur (where 1.0 is best) works.

Calibrate a new system against these landmarks so it stays consistent with the rest:

| Index | Equivalent |
|-------|------------|
| 99 | top ~0.5% of applicants |
| 95 | IB 42 · A\*A\*A |
| 91 | IB 40 · A\*AA |
| 86 | IB 38 · AAA · GPA 3.8 |
| 80 | IB 36 · AAB |
| 68 | IB 32 · BBB |
| 45 | IB 25 · CCC |

For letter-grade systems use `kind: 'choice'` with an `options` array of
`{ value: 'AAB', index: 82 }` instead of anchors.

---

## Updating exchange rates

`reference/currencies.js` holds indicative rates as "US dollars per unit". They only
affect cross-border cost comparison, so precision is not critical — but update them
when they drift far enough to mislead.


---

## Generated data and the importers

Two files under `data/` are **generated** and carry a "do not edit by hand" header:

| File | Source | Contents |
|---|---|---|
| `universities/uk-outcomes.js` | Discover Uni (HESA / OfS) | Employment, graduate salary, NSS satisfaction, continuation, entry tariff, TEF — per UK university |
| `reference/country-stats.js` | Eurostat | Graduate employment, NEET rate, early leavers — per country |

They are kept **separate from hand-written records and merged at load time**, so
re-running an import can never overwrite curated data. A hand-written record and its
generated outcomes live in different files and are joined by `id` in
`assets/js/lib/data.js`.

### Regenerating

```bash
# Discover Uni — download and unzip the dataset first
node tools/import/discoveruni.mjs <path-to-extracted-csvs> --json uk-institutions.json

# Eurostat — point at a folder of estat_*.tsv.gz files
node tools/import/eurostat.mjs <path-to-tsv-gz-folder> --json eurostat.json

# Turn both into the generated data files
node tools/import/generate.mjs eurostat.json uk-institutions.json
npm run validate
```

Both importers print a report before writing anything, so the numbers can be checked
before they become site data.

### What these sources deliberately do not provide

**Acceptance rates.** Discover Uni does not publish them, and they cannot be inferred
from entry tariff. In the current data LSE and Bristol share a mean tariff of 155 but
admit 11% and 45% of applicants respectively; Edinburgh has a *higher* tariff than LSE
and four times the acceptance rate. Across the twelve hand-researched UK universities
the correlation between mean tariff and acceptance rate is only r = -0.44.

Since acceptance rate is the largest single input to the admission-chance model,
deriving one from tariff would quietly corrupt the site's core feature. Where a real
acceptance rate is not available, the honest signal is the **entry tariff distribution** —
`shareTariff144Plus` and `shareTariff160Plus` record what entrants actually held, which
tells a student more than an offer does.

**Fees and living costs.** Neither source carries them. These remain hand-researched.
