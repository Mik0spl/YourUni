/**
 * Country context for studying abroad.
 *
 *  livingIndex   0–100, higher = more expensive day-to-day (rent, food, transport)
 *  visaDifficulty 1 (straightforward) – 5 (hard / heavily capped)
 *  safety        0–100, higher = safer
 *  englishTaught 'widespread' | 'common' | 'limited'
 */
export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America', currency: 'USD', symbol: '$',
    livingIndex: 78, language: ['English'], englishTaught: 'widespread', visaDifficulty: 4, safety: 66,
    postStudyWork: 'OPT: 12 months, +24 for STEM degrees', workDuringStudy: '20 h/week on campus only',
    tuitionNote: 'No public-tuition discount for internationals; private universities charge one rate for everyone.',
    healthcare: 'Private insurance mandatory, usually $1,500–3,500/yr through the university.' },

  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', currency: 'GBP', symbol: '£',
    livingIndex: 72, language: ['English'], englishTaught: 'widespread', visaDifficulty: 3, safety: 74,
    postStudyWork: 'Graduate Route: 2 years (3 for PhD)', workDuringStudy: '20 h/week during term',
    tuitionNote: 'International fees are roughly 2–3× the home rate and are set per course.',
    healthcare: 'NHS access via the Immigration Health Surcharge, ~£776/yr for students.' },

  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America', currency: 'CAD', symbol: 'C$',
    livingIndex: 66, language: ['English', 'French'], englishTaught: 'widespread', visaDifficulty: 3, safety: 82,
    postStudyWork: 'PGWP: up to 3 years depending on programme length', workDuringStudy: '24 h/week off campus',
    tuitionNote: 'Provincially regulated; Quebec and the Prairies are markedly cheaper than Ontario or BC.',
    healthcare: 'Provincial cover in some provinces, otherwise university plans ~C$800/yr.' },

  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 64, language: ['Dutch', 'English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 84,
    postStudyWork: 'Orientation Year (zoekjaar): 12 months', workDuringStudy: '16 h/week, or full-time in summer',
    tuitionNote: 'EU/EEA students pay the statutory fee (~€2,600); non-EU pay institutional rates.',
    healthcare: 'Dutch basic insurance required if you work; otherwise private student cover ~€600/yr.' },

  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 58, language: ['German', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 80,
    postStudyWork: '18-month job-seeker residence permit', workDuringStudy: '140 full or 280 half days per year',
    tuitionNote: 'Most public universities charge no tuition — only a semester contribution of €150–400. Baden-Württemberg charges non-EU students €1,500/semester.',
    healthcare: 'Public student insurance ~€130/month, mandatory.' },

  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 62, language: ['French', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 72,
    postStudyWork: 'APS: 12-month temporary residence permit', workDuringStudy: '964 h/year (~20 h/week)',
    tuitionNote: 'Public universities charge €2,770/yr for non-EU bachelors; grandes écoles charge far more.',
    healthcare: 'Free registration with French social security for students.' },

  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', currency: 'CHF', symbol: 'CHF',
    livingIndex: 96, language: ['German', 'French', 'Italian', 'English'], englishTaught: 'common', visaDifficulty: 3, safety: 90,
    postStudyWork: '6-month permit to find work', workDuringStudy: '15 h/week during term',
    tuitionNote: 'Tuition is low even for internationals (CHF 1,000–4,000/yr) — living costs are the real expense.',
    healthcare: 'Swiss health insurance mandatory, CHF 100–250/month.' },

  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', currency: 'SEK', symbol: 'kr',
    livingIndex: 68, language: ['Swedish', 'English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 83,
    postStudyWork: '12-month permit to seek work', workDuringStudy: 'No formal hour limit',
    tuitionNote: 'Free for EU/EEA; non-EU pay SEK 80,000–180,000/yr.',
    healthcare: 'Covered by residence permit for stays over one year.' },

  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'Europe', currency: 'DKK', symbol: 'kr',
    livingIndex: 74, language: ['Danish', 'English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 87,
    postStudyWork: '3-year establishment card after a Danish degree', workDuringStudy: '20 h/week',
    tuitionNote: 'Free for EU/EEA; non-EU pay DKK 45,000–120,000/yr.',
    healthcare: 'Free public healthcare with a CPR number.' },

  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', currency: 'NOK', symbol: 'kr',
    livingIndex: 80, language: ['Norwegian', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 88,
    postStudyWork: '12-month job-seeker permit', workDuringStudy: '20 h/week',
    tuitionNote: 'Free for EU/EEA. Non-EU students have paid tuition since 2023 (NOK 130,000–500,000/yr).',
    healthcare: 'Public healthcare with residence over 12 months.' },

  { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 63, language: ['Finnish', 'Swedish', 'English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 90,
    postStudyWork: '2-year residence permit to look for work', workDuringStudy: '30 h/week average',
    tuitionNote: 'Free for EU/EEA; non-EU pay €8,000–18,000/yr, with generous first-year scholarships.',
    healthcare: 'Student healthcare via FSHS, ~€75/year.' },

  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 55, language: ['Italian', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 74,
    postStudyWork: '12-month permit to seek work', workDuringStudy: '20 h/week',
    tuitionNote: 'Fees scale with family income (ISEE) — low-income families often pay almost nothing at public universities.',
    healthcare: 'Voluntary SSN registration ~€150/yr.' },

  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 52, language: ['Spanish', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 78,
    postStudyWork: '12-month job-search permit', workDuringStudy: '30 h/week',
    tuitionNote: 'Public universities are inexpensive; non-EU students pay 1.5–3× the domestic rate in some regions.',
    healthcare: 'Private student insurance required for the visa, ~€500/yr.' },

  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 76, language: ['English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 80,
    postStudyWork: 'Third Level Graduate Programme: 12–24 months', workDuringStudy: '20 h/week during term',
    tuitionNote: 'EU students pay only the student contribution (~€3,000); non-EU pay €12,000–55,000.',
    healthcare: 'Private insurance required for non-EU students.' },

  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 60, language: ['Dutch', 'French', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 76,
    postStudyWork: '12-month search year', workDuringStudy: '20 h/week',
    tuitionNote: 'Around €1,000/yr for EU students; non-EU rates vary by community and institution.',
    healthcare: 'Mandatory mutuelle registration, ~€120/yr.' },

  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 62, language: ['German', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 85,
    postStudyWork: '12-month residence permit for job-seekers', workDuringStudy: '20 h/week',
    tuitionNote: 'EU students pay ~€380/semester; non-EU roughly double.',
    healthcare: 'Student self-insurance ~€70/month.' },

  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe', currency: 'PLN', symbol: 'zł',
    livingIndex: 38, language: ['Polish', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 80,
    postStudyWork: '9-month permit to seek work', workDuringStudy: 'Unrestricted with a student permit',
    tuitionNote: 'English-taught programmes €2,000–6,000/yr; Polish-taught public study is free.',
    healthcare: 'NFZ voluntary insurance ~PLN 55/month.' },

  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', region: 'Europe', currency: 'CZK', symbol: 'Kč',
    livingIndex: 42, language: ['Czech', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 84,
    postStudyWork: '9-month job-seeker permit', workDuringStudy: 'Unrestricted with a student permit',
    tuitionNote: 'Czech-taught degrees are free at public universities, including for internationals.',
    healthcare: 'Commercial student insurance ~CZK 6,000/yr.' },

  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', currency: 'EUR', symbol: '€',
    livingIndex: 48, language: ['Portuguese', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 85,
    postStudyWork: '12-month job-search permit', workDuringStudy: '20 h/week',
    tuitionNote: 'Public tuition ~€700–1,250/yr for EU, €3,000–8,000 for non-EU.',
    healthcare: 'SNS access after residency registration.' },

  { code: 'HU', name: 'Hungary', flag: '🇭🇺', region: 'Europe', currency: 'HUF', symbol: 'Ft',
    livingIndex: 40, language: ['Hungarian', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 78,
    postStudyWork: '9-month residence permit for job-seeking', workDuringStudy: '30 h/week',
    tuitionNote: 'English-taught medicine and engineering are the main draws, €6,000–18,000/yr.',
    healthcare: 'Student insurance ~€200/yr.' },

  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', currency: 'AUD', symbol: 'A$',
    livingIndex: 74, language: ['English'], englishTaught: 'widespread', visaDifficulty: 3, safety: 82,
    postStudyWork: 'Temporary Graduate visa: 2–3 years', workDuringStudy: '48 h/fortnight during term',
    tuitionNote: 'International fees are unsubsidised: A$35,000–55,000/yr is typical.',
    healthcare: 'Overseas Student Health Cover mandatory, ~A$600/yr.' },

  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', currency: 'NZD', symbol: 'NZ$',
    livingIndex: 66, language: ['English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 86,
    postStudyWork: 'Post-study work visa: up to 3 years', workDuringStudy: '20 h/week',
    tuitionNote: 'International fees NZ$28,000–45,000/yr.',
    healthcare: 'Insurance required for the visa, ~NZ$600/yr.' },

  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia', currency: 'SGD', symbol: 'S$',
    livingIndex: 82, language: ['English'], englishTaught: 'widespread', visaDifficulty: 3, safety: 94,
    postStudyWork: '1-year Long-Term Visit Pass for graduates', workDuringStudy: '16 h/week during term',
    tuitionNote: 'The MOE Tuition Grant cuts fees sharply in exchange for a 3-year bond working in Singapore.',
    healthcare: 'University health plans, ~S$100/yr plus insurance.' },

  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia', currency: 'HKD', symbol: 'HK$',
    livingIndex: 79, language: ['English', 'Cantonese'], englishTaught: 'widespread', visaDifficulty: 2, safety: 85,
    postStudyWork: 'IANG visa: 2 years, no job offer needed', workDuringStudy: '20 h/week on campus',
    tuitionNote: 'Non-local tuition HK$145,000–200,000/yr, with large entrance scholarships available.',
    healthcare: 'Public system accessible; university insurance recommended.' },

  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', currency: 'JPY', symbol: '¥',
    livingIndex: 58, language: ['Japanese', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 92,
    postStudyWork: 'Designated Activities visa: 1 year to job-hunt', workDuringStudy: '28 h/week with permission',
    tuitionNote: 'National universities charge the same ¥535,800/yr to everyone, domestic or not.',
    healthcare: 'National Health Insurance ~¥20,000/yr for students.' },

  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia', currency: 'CNY', symbol: '¥',
    livingIndex: 44, language: ['Mandarin', 'English'], englishTaught: 'common', visaDifficulty: 3, safety: 84,
    postStudyWork: 'Job-seeking residence permit available for graduates of top universities', workDuringStudy: 'Permitted with university and visa approval',
    tuitionNote: 'CSC scholarships cover full tuition plus a stipend at most leading universities.',
    healthcare: 'Comprehensive insurance required, ~¥800/yr.' },

  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', currency: 'KRW', symbol: '₩',
    livingIndex: 60, language: ['Korean', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 88,
    postStudyWork: 'D-10 job-seeking visa: up to 2 years', workDuringStudy: '25 h/week during term',
    tuitionNote: 'Around ₩6–12 million per year, with heavy scholarship discounting for strong applicants.',
    healthcare: 'National Health Insurance mandatory, ~₩60,000/month.' },

  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia', currency: 'TWD', symbol: 'NT$',
    livingIndex: 46, language: ['Mandarin', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 88,
    postStudyWork: 'Job-seeking extension up to 1 year', workDuringStudy: '20 h/week with a work permit',
    tuitionNote: 'Public universities charge NT$50,000–110,000/yr, among the best value in Asia.',
    healthcare: 'NHI after six months, ~NT$800/month.' },

  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', currency: 'AED', symbol: 'AED',
    livingIndex: 68, language: ['Arabic', 'English'], englishTaught: 'widespread', visaDifficulty: 2, safety: 89,
    postStudyWork: 'Green visa for graduates, up to 5 years', workDuringStudy: 'Permitted with a work permit',
    tuitionNote: 'Branch campuses charge close to their home-country rates.',
    healthcare: 'Insurance mandatory and usually bundled with the visa.' },

  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East', currency: 'ILS', symbol: '₪',
    livingIndex: 72, language: ['Hebrew', 'English'], englishTaught: 'common', visaDifficulty: 3, safety: 62,
    postStudyWork: 'Limited; extensions tied to employer sponsorship', workDuringStudy: 'Restricted for student visas',
    tuitionNote: 'International programmes are priced in dollars, roughly $12,000–20,000/yr.',
    healthcare: 'Private student insurance required.' },

  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Latin America', currency: 'BRL', symbol: 'R$',
    livingIndex: 36, language: ['Portuguese'], englishTaught: 'limited', visaDifficulty: 2, safety: 52,
    postStudyWork: 'Requires switching to a work visa', workDuringStudy: 'Restricted',
    tuitionNote: 'Federal and state universities are tuition-free, including for international students.',
    healthcare: 'SUS public system is free; private insurance recommended.' },

  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Latin America', currency: 'MXN', symbol: 'MX$',
    livingIndex: 38, language: ['Spanish', 'English'], englishTaught: 'limited', visaDifficulty: 2, safety: 55,
    postStudyWork: 'Convert to a work visa with an employer offer', workDuringStudy: 'With authorisation',
    tuitionNote: 'Public universities are almost free; private ones charge $6,000–18,000/yr.',
    healthcare: 'IMSS enrolment through the university.' },

  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', currency: 'ZAR', symbol: 'R',
    livingIndex: 34, language: ['English', 'Afrikaans'], englishTaught: 'widespread', visaDifficulty: 3, safety: 44,
    postStudyWork: 'Critical-skills visa for eligible graduates', workDuringStudy: '20 h/week',
    tuitionNote: 'Among the lowest fees for an English-taught degree, R60,000–130,000/yr.',
    healthcare: 'Registration with a South African medical scheme required.' },

  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia', currency: 'INR', symbol: '₹',
    livingIndex: 26, language: ['English', 'Hindi'], englishTaught: 'widespread', visaDifficulty: 2, safety: 58,
    postStudyWork: 'Requires an employment visa conversion', workDuringStudy: 'Not permitted on a student visa',
    tuitionNote: 'IIT and IISc fees for internationals are a fraction of Western equivalents.',
    healthcare: 'Private insurance recommended, very low cost.' },

  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', region: 'Europe', currency: 'TRY', symbol: '₺',
    livingIndex: 32, language: ['Turkish', 'English'], englishTaught: 'common', visaDifficulty: 2, safety: 62,
    postStudyWork: 'Work permit required after graduation', workDuringStudy: 'Permitted after the first year',
    tuitionNote: 'State universities charge internationals $500–3,000/yr; Türkiye Bursları covers everything.',
    healthcare: 'SGK enrolment within three months of arrival.' }
];

export const countryByCode = Object.fromEntries(countries.map(c => [c.code, c]));
export const countryByName = Object.fromEntries(countries.map(c => [c.name, c]));
