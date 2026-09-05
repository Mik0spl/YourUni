# YourUni

University search built for international students. Enter your school system and grades —
get a shortlist where you're genuinely competitive, your grades converted to local
requirements, per-university document checklists, deadlines, and scholarships you're
eligible for.

**116 universities · 35 countries · 124 scholarships · 16 grading systems.** No account,
no login, no tracking. It's a static website — open the URL and it works.

---

## What it does

**Converts your grades to anywhere.** IB, A-Levels, US GPA, Abitur, Maturità, Matura,
Baccalauréat, ATAR, Gaokao, CBSE, ENEM, EGE and more — all mapped onto one academic index,
so a Polish Matura score can be read against an Oxford offer without guesswork.

**Estimates your admission chances honestly.** Starts from the university's published
acceptance rate and moves it based on how your grades compare to theirs, whether your tests
and English clear the bar, and how much your activities count *in that country's admissions
culture* — because a US committee reads your whole life and a German numerus clausus place
is decided by your Abitur grade alone.

**Tells you what would actually help.** Not generic advice: the model is re-run with each
possible change applied and reports the real difference in percentage points, averaged
across the universities you're aiming at.

**Shows the full cost.** Tuition and living costs in local currency, converted to a common
currency so cross-border comparison means something, plus the EU/EEA rate where it differs
and the things nobody puts in the headline figure — health cover, visas, work rights.

**Finds scholarships you can actually get.** Every award has an academic bar and citizenship
rules, checked against your profile. "Not eligible" always comes with the reason.

**Compares up to four universities** across 35 rows, highlighting the best value in each.

---

## Pages

| Page | What it's for |
|------|---------------|
| `index.html` | Landing page with a live grade converter |
| `explore.html` | All 116 universities with search, filters and sorting |
| `university.html?id=mit` | Full profile: requirements, cost, life, applying |
| `chances.html` | Your list sorted into likely / target / reach, plus how to improve |
| `profile.html` | Grades, tests, subjects, budget, activities |
| `scholarships.html` | Filterable, with eligibility checked against your grades |
| `compare.html` | Four universities side by side |
| `about.html` | Where the numbers come from and how chances are calculated |

---

## Running it locally

You need [Node 18 or newer](https://nodejs.org). Nothing else — there are no
dependencies to install.

```bash
git clone https://github.com/Mik0spl/YourUni.git
cd YourUni
npm start
```

Then open **<http://localhost:8777>**.

`npm start` runs a small static server (`tools/serve.mjs`, about 80 lines, no
dependencies) that works the same on Windows, macOS and Linux. If port 8777 is taken it
steps up to the next free one and tells you which; `PORT=3000 npm start` picks your own.

**Do not open `index.html` by double-clicking it.** The site is built from ES modules,
and browsers refuse to load those over `file://` — you get a blank page and a CORS error
in the console. It has to be served over HTTP, which is all `npm start` does.

Any other static server works too: `npx serve`, `python3 -m http.server 8777`, or the
Live Server extension in VS Code.

### Deploying

It's static files, so anywhere works.

**GitHub Pages** — Settings → Pages → Deploy from a branch → pick the branch and
`/ (root)`. Note that Pages on a **private** repository requires a paid GitHub plan; on
the free plan the repository has to be public.

**Netlify, Cloudflare Pages, Vercel** — all deploy private repositories on their free
tiers. Connect the repo, leave the build command empty, and set the output directory to
`/`. Nothing needs configuring because there is nothing to build.

---

## Adding data

All data lives in `/data` as plain JavaScript, split by region so the files stay editable.
Adding a university means appending an object to a file; adding a whole grading system means
appending its conversion anchors.

```bash
npm run validate
```

The validator checks required fields, value ranges, and every cross-reference (field ids,
country codes, scholarship ids) — and names the file and the problem when something is off.

**[`data/README.md`](data/README.md) documents every field**, with a fully annotated example
for universities, scholarships and grading systems.

---

## How it's built

Vanilla JavaScript ES modules, no framework, no bundler, no dependencies.

```
index.html  explore.html  university.html  chances.html
profile.html  scholarships.html  compare.html  about.html
│
├── assets/css/
│   ├── tokens.css        colour, type and spacing — light and dark
│   ├── base.css          reset, elements, layout primitives
│   ├── components.css    buttons, cards, filters, meters, tables
│   └── pages.css         page-level composition
│
├── assets/js/lib/
│   ├── data.js           loads the data files and derives what the UI needs
│   ├── grades.js         the conversion engine
│   ├── chances.js        the admission probability model
│   ├── profile.js        localStorage, the only place your data goes
│   ├── charts.js         dial, meters, score bars, stacked bars, stat tiles
│   ├── cards.js          the university card, shared by four pages
│   ├── ui.js             header, footer, theme, toasts, tooltips
│   └── format.js         currency, percentages, numbers
│
├── assets/js/pages/      one file per page
├── tools/serve.mjs       the local dev server
└── data/                 see data/README.md
```

**Design.** Warm-paper light theme, deep-ink dark theme, following your system setting by
default with an in-page toggle that overrides it. Charts never rely on colour alone — every
admission band carries an icon and a written label, and cost breakdowns ship a table view.
The categorical palette is validated for protanopia and deuteranopia separation rather than
picked by eye.

**Privacy.** Your grades, subjects, activities, shortlist and comparison are written to
`localStorage` under `youruni.profile.v1` and never leave the browser. There is no backend
to send them to. The only external request the site makes is to Google Fonts.

---

## Accuracy

Figures are compiled by hand from public sources and are approximations — rankings are a
composite across the major tables, acceptance rates are university-wide (course-level rates
are often far lower), and living costs are mid-range estimates for the city.

The chance model can't see your essays, your references, your interview, or whether a
department quietly halved its intake. It's built to sort a hundred universities into
"realistic" and "not", which it does well — not to predict a decision about you.

**Always confirm fees, deadlines and requirements on the university's own website.**
