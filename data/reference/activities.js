/**
 * Extracurricular activities and how much they actually move an admission decision.
 *
 *  impact  0–10 contribution to the profile's activity score (the score is the
 *          weighted sum of your strongest few, not a raw total — see lib/chances.js)
 *  tier    exceptional | strong | solid | supporting
 *  bestFor field ids this counts double for, or 'all'
 *
 * The same activity is worth very different amounts depending on where you apply.
 * `admissionsCulture` scales the whole activity score per country: a US committee
 * reads your whole life, a Dutch numerus fixus programme mostly reads your grades.
 */
export const activityCategories = [
  { id: 'academic',   name: 'Academic & research', icon: '🔬' },
  { id: 'leadership', name: 'Leadership & initiative', icon: '🚩' },
  { id: 'service',    name: 'Service & community', icon: '🤝' },
  { id: 'creative',   name: 'Creative & performance', icon: '🎭' },
  { id: 'work',       name: 'Work & experience', icon: '💼' },
  { id: 'sport',      name: 'Sport', icon: '🏅' }
];

export const activities = [
  // ---------- Exceptional --------------------------------------------------
  { id: 'intl-olympiad', name: 'International olympiad medal', category: 'academic',
    tier: 'exceptional', impact: 10, effort: 'Very high', timeline: '3+ years',
    bestFor: ['mathematics', 'physical-sciences', 'computer-science', 'life-sciences'],
    description: 'A medal at IMO, IPhO, IChO, IBO or IOI. One of the very few credentials that can carry an application on its own.',
    evidence: 'Official result page, medal certificate, national team selection letter.' },

  { id: 'published-research', name: 'Published or presented research', category: 'academic',
    tier: 'exceptional', impact: 9, effort: 'Very high', timeline: '1–2 years',
    bestFor: ['life-sciences', 'physical-sciences', 'computer-science', 'psychology', 'mathematics'],
    description: 'A paper in a peer-reviewed venue, a preprint with a real supervisor, or a poster at a recognised conference. Proves you can do the thing universities exist to do.',
    evidence: 'DOI or arXiv link, supervisor reference, conference programme.' },

  { id: 'venture', name: 'Founded a venture with real traction', category: 'leadership',
    tier: 'exceptional', impact: 8.5, effort: 'Very high', timeline: '2+ years',
    bestFor: ['business', 'computer-science', 'engineering'],
    description: 'A company, non-profit or product with users, revenue or measurable reach. "Traction" is the operative word — an idea deck is not this.',
    evidence: 'Revenue or user numbers, registration documents, press coverage.' },

  { id: 'national-team-sport', name: 'National-level athlete', category: 'sport',
    tier: 'exceptional', impact: 8, effort: 'Very high', timeline: '4+ years',
    bestFor: 'all',
    description: 'Representing your country, or competing in the top national division. In the US this can also open recruited-athlete routes that change the odds entirely.',
    evidence: 'Federation ranking, selection letters, competition results.' },

  { id: 'major-arts-award', name: 'National or international arts award', category: 'creative',
    tier: 'exceptional', impact: 8, effort: 'Very high', timeline: '3+ years',
    bestFor: ['arts', 'media', 'humanities', 'architecture'],
    description: 'A prize at a recognised competition, a published book, a screened film, or an exhibited body of work.',
    evidence: 'Award listing, exhibition catalogue, portfolio link.' },

  // ---------- Strong -------------------------------------------------------
  { id: 'national-olympiad', name: 'National olympiad finalist', category: 'academic',
    tier: 'strong', impact: 7, effort: 'High', timeline: '2+ years',
    bestFor: ['mathematics', 'physical-sciences', 'computer-science', 'life-sciences'],
    description: 'Reaching the national round of a subject olympiad. Enormously respected and much more attainable than an international medal.',
    evidence: 'Results list, organiser certificate.' },

  { id: 'research-assistant', name: 'Research assistant or lab placement', category: 'academic',
    tier: 'strong', impact: 6.5, effort: 'High', timeline: '3–12 months',
    bestFor: ['life-sciences', 'physical-sciences', 'psychology', 'medicine', 'environment'],
    description: 'Sustained work in a university or industry lab, even unpaid and even doing the unglamorous parts. Shows you know what research actually feels like.',
    evidence: 'Supervisor letter, description of your specific contribution.' },

  { id: 'built-organisation', name: 'Built an organisation or programme', category: 'leadership',
    tier: 'strong', impact: 6.5, effort: 'High', timeline: '2+ years',
    bestFor: 'all',
    description: 'You started something that outlived your involvement — a tutoring programme, a festival, a team, a publication — and it grew beyond you.',
    evidence: 'Participation numbers, handover documentation, local press.' },

  { id: 'sustained-leadership', name: 'Sustained leadership role (2+ years)', category: 'leadership',
    tier: 'strong', impact: 6, effort: 'Medium', timeline: '2+ years',
    bestFor: 'all',
    description: 'Captain, editor, president, section leader — held long enough to show something changed under you. Depth beats a list of titles collected in final year.',
    evidence: 'What was different when you left: numbers, not adjectives.' },

  { id: 'selective-programme', name: 'Selective summer or academic programme', category: 'academic',
    tier: 'strong', impact: 5.5, effort: 'Medium', timeline: 'One summer',
    bestFor: 'all',
    description: 'Competitive-entry programmes such as RSI, SUMaC, LSE summer schools or national academies. The selectivity is the signal — pay-to-attend programmes are not this.',
    evidence: 'Acceptance letter, acceptance rate of the programme.' },

  { id: 'serious-portfolio', name: 'Serious creative portfolio', category: 'creative',
    tier: 'strong', impact: 6, effort: 'High', timeline: '1–3 years',
    bestFor: ['arts', 'architecture', 'media'],
    description: 'For art, design and architecture courses the portfolio is often weighted more heavily than grades. Coherence and development matter more than volume.',
    evidence: 'Curated 15–25 piece portfolio showing process, not just outcomes.' },

  { id: 'open-source', name: 'Substantial open-source or public project', category: 'academic',
    tier: 'strong', impact: 5.5, effort: 'Medium', timeline: '6+ months',
    bestFor: ['computer-science', 'engineering', 'mathematics'],
    description: 'A library, dataset, game or tool other people actually use. Public commit history is unusually credible evidence.',
    evidence: 'Repository link, stars/downloads, contributions to others’ projects.' },

  // ---------- Solid --------------------------------------------------------
  { id: 'subject-competition', name: 'Regional subject competition', category: 'academic',
    tier: 'solid', impact: 4, effort: 'Medium', timeline: 'Months',
    bestFor: 'all',
    description: 'Regional maths, debating, business or science competitions. Good supporting evidence of genuine subject interest.',
    evidence: 'Placement certificate.' },

  { id: 'school-leadership', name: 'School leadership position', category: 'leadership',
    tier: 'solid', impact: 3.5, effort: 'Medium', timeline: '1 year',
    bestFor: 'all',
    description: 'Student council, prefect, club founder. Common enough that what you did with it matters far more than the title.',
    evidence: 'A specific initiative you ran and its result.' },

  { id: 'long-service', name: 'Long-term community service (100+ hours)', category: 'service',
    tier: 'solid', impact: 4, effort: 'Medium', timeline: '1–2 years',
    bestFor: 'all',
    description: 'One cause, sustained. Committees read three years at one shelter as far stronger than thirty scattered afternoons.',
    evidence: 'Hours log, organisation reference.' },

  { id: 'tutoring', name: 'Teaching or tutoring others', category: 'service',
    tier: 'solid', impact: 3.5, effort: 'Low', timeline: 'Ongoing',
    bestFor: ['education', 'mathematics', 'humanities'],
    description: 'Especially strong if you built the programme, taught underserved students, or taught your intended subject.',
    evidence: 'Number of students, duration, outcomes.' },

  { id: 'internship', name: 'Internship in your intended field', category: 'work',
    tier: 'solid', impact: 4, effort: 'Medium', timeline: 'Weeks–months',
    bestFor: 'all',
    description: 'Direct exposure to the field. For medicine, clinical or care experience is close to a requirement rather than a bonus.',
    evidence: 'Reference letter, description of responsibilities.' },

  { id: 'hackathon', name: 'Hackathons and case competitions', category: 'academic',
    tier: 'solid', impact: 3, effort: 'Low', timeline: 'Weekends',
    bestFor: ['computer-science', 'business', 'engineering'],
    description: 'Wins count for more than attendance. A single strong result beats a long list of participations.',
    evidence: 'Project link, placement, team size.' },

  { id: 'mun-debate', name: 'Model UN or competitive debate', category: 'leadership',
    tier: 'solid', impact: 3.5, effort: 'Medium', timeline: '1–2 years',
    bestFor: ['law', 'social-sciences', 'humanities', 'business'],
    description: 'Awards at national conferences carry real weight for law, politics and international relations applications.',
    evidence: 'Awards, conferences attended, positions held.' },

  { id: 'regional-sport', name: 'Regional or club-level sport', category: 'sport',
    tier: 'solid', impact: 3, effort: 'Medium', timeline: '2+ years',
    bestFor: 'all',
    description: 'Demonstrates commitment and time management. Rarely decisive on its own outside the US.',
    evidence: 'Team, league, years played, any captaincy.' },

  // ---------- Supporting ---------------------------------------------------
  { id: 'part-time-job', name: 'Part-time job', category: 'work',
    tier: 'supporting', impact: 2.5, effort: 'Medium', timeline: 'Ongoing',
    bestFor: 'all',
    description: 'Undervalued by students and well understood by committees, especially where the job supported your family or funded your studies. Say so plainly.',
    evidence: 'Hours per week, duration, responsibilities.' },

  { id: 'language-cert', name: 'Additional language certification', category: 'academic',
    tier: 'supporting', impact: 2, effort: 'Medium', timeline: 'Months',
    bestFor: ['humanities', 'social-sciences', 'business', 'law'],
    description: 'A recognised B2/C1 certificate in a third language. Matters most in Europe and for international-relations courses.',
    evidence: 'DELF, Goethe, DELE, HSK or equivalent certificate.' },

  { id: 'moocs', name: 'Online courses and certificates', category: 'academic',
    tier: 'supporting', impact: 1.5, effort: 'Low', timeline: 'Weeks',
    bestFor: 'all',
    description: 'Weak on their own — anyone can enrol. They help only as evidence behind something you built or a subject you pursued independently.',
    evidence: 'Certificate plus, more importantly, what you made with it.' },

  { id: 'club-member', name: 'School club membership', category: 'leadership',
    tier: 'supporting', impact: 1, effort: 'Low', timeline: 'Ongoing',
    bestFor: 'all',
    description: 'Membership alone reads as filler. It becomes valuable the moment you lead something inside the club.',
    evidence: 'Only worth listing if you can point to a contribution.' }
];

export const activityById = Object.fromEntries(activities.map(a => [a.id, a]));

/**
 * How much extracurriculars actually count, by country.
 *  weight 0–1 multiplier applied to the activity score
 */
export const admissionsCulture = {
  US: { weight: 1.0, label: 'Fully holistic',
        note: 'Essays, activities, recommendations and context are read alongside grades. Activities can genuinely change the outcome here.' },
  GB: { weight: 0.35, label: 'Grades and subject fit',
        note: 'UCAS decisions turn on predicted grades and your personal statement. Activities count only when they show subject commitment — a maths olympiad helps, a sports captaincy mostly does not.' },
  CA: { weight: 0.5, label: 'Grades first, some holistic review',
        note: 'Most programmes are grade-driven, but supplementary applications at UBC, Waterloo and McMaster do read activities seriously.' },
  AU: { weight: 0.2, label: 'Rank-driven',
        note: 'Entry usually follows an ATAR cut-off. Activities matter for scholarships and a few portfolio courses rather than for entry.' },
  NL: { weight: 0.25, label: 'Grades and matching',
        note: 'Numerus fixus programmes run a selection procedure that can include motivation and relevant experience; everything else is largely grade-based.' },
  DE: { weight: 0.1, label: 'Almost purely grade-based',
        note: 'Numerus clausus places are allocated by Abitur grade. Extracurriculars rarely enter the decision at undergraduate level.' },
  FR: { weight: 0.4, label: 'Dossier review',
        note: 'Parcoursup and grandes écoles read the full dossier, including your motivation letter and record of engagement.' },
  CH: { weight: 0.1, label: 'Qualification-based',
        note: 'If your school-leaving qualification is recognised and you meet the bar, you are generally admitted.' },
  SG: { weight: 0.55, label: 'Holistic within a grade band',
        note: 'You must clear a high academic bar first; beyond it, portfolio and interviews separate candidates.' },
  HK: { weight: 0.45, label: 'Grades plus interview',
        note: 'Strong results get you shortlisted; interviews and non-academic achievements decide the rest.' },
  JP: { weight: 0.35, label: 'Exams plus documents',
        note: 'English-track programmes read essays and activities; Japanese-track entry is exam-dominated.' },
  CN: { weight: 0.35, label: 'Scores plus documents',
        note: 'International tracks assess transcripts, a study plan and sometimes an interview.' },
  KR: { weight: 0.45, label: 'Comprehensive review',
        note: 'The haksaengbu jonghap route reviews activities and self-introduction alongside grades.' },
  SE: { weight: 0.15, label: 'Merit-rating based', note: 'Selection runs on a calculated merit rating from your grades.' },
  DK: { weight: 0.25, label: 'Quota 1 and Quota 2',
        note: 'Quota 1 is pure grade average; Quota 2 explicitly rewards relevant experience and motivation.' },
  NO: { weight: 0.1, label: 'Points-based', note: 'Admission points come from grades, with small age and military-service additions.' },
  FI: { weight: 0.3, label: 'Entrance exams', note: 'Many programmes run their own entrance exam that outweighs school grades.' },
  IT: { weight: 0.2, label: 'Entrance test based', note: 'Most competitive courses run a national or institutional admission test.' },
  ES: { weight: 0.15, label: 'Score-based', note: 'Entry follows the Selectividad/EBAU score against programme cut-offs.' },
  IE: { weight: 0.15, label: 'Points-based', note: 'CAO points from your final exams decide entry for most courses.' },
  AT: { weight: 0.1, label: 'Qualification-based', note: 'Open access for most subjects with a recognised qualification.' },
  BE: { weight: 0.15, label: 'Open access with exceptions', note: 'Medicine and dentistry require an entrance exam; most other courses are open.' },
  PL: { weight: 0.15, label: 'Matura score based', note: 'Recruitment points are computed directly from Matura results.' },
  CZ: { weight: 0.2, label: 'Entrance exam based', note: 'Faculties set their own entrance examinations.' },
  PT: { weight: 0.15, label: 'Score-based', note: 'National contest allocates places by exam score.' },
  HU: { weight: 0.2, label: 'Score plus entrance exam', note: 'Medical programmes run biology and chemistry entrance exams.' },
  NZ: { weight: 0.2, label: 'Rank-driven', note: 'NCEA rank score decides most entry; activities count for scholarships.' },
  AE: { weight: 0.5, label: 'Follows the home campus', note: 'Branch campuses apply their parent university’s admissions approach.' },
  IL: { weight: 0.3, label: 'Psychometric plus grades', note: 'The psychometric entrance test combines with your school average.' },
  BR: { weight: 0.1, label: 'Vestibular / ENEM based', note: 'Entry is decided by examination score alone.' },
  MX: { weight: 0.15, label: 'Entrance exam based', note: 'Institutional admission exams decide most places.' },
  ZA: { weight: 0.2, label: 'APS points based', note: 'Admission Point Score from your NSC results decides entry.' },
  IN: { weight: 0.1, label: 'Entrance exam based', note: 'JEE, NEET and similar exams dominate; boards matter as a threshold.' },
  TW: { weight: 0.3, label: 'Documents plus interview', note: 'International admissions review transcripts, a study plan and references.' },
  TR: { weight: 0.2, label: 'Exam-score based', note: 'YKS score or an international equivalent decides placement.' }
};

export const DEFAULT_CULTURE = { weight: 0.3, label: 'Mixed review',
  note: 'Grades lead the decision, with supporting documents considered.' };
