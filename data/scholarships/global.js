/**
 * Government and cross-border scholarship programmes — not tied to one university.
 *
 * eligibility.minIndex is on the shared 0–100 academic index (see
 * data/reference/grade-systems.js), so the site can tell a student whether
 * their grades clear the bar without knowing their grading system.
 *
 * citizenship: 'any' | 'non-eu' | 'eu' | 'developing' | ['US','CA', …]
 */
export const scholarships = [
  {
    id: 'csc-chinese-government', name: 'Chinese Government Scholarship (CSC)',
    provider: 'China Scholarship Council', scope: 'country', country: 'CN',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, accommodation, medical insurance and a monthly stipend' },
    eligibility: { minIndex: 72, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'January–April (varies by embassy)', renewable: true,
    link: 'https://campuschina.org',
    note: 'Apply either through the Chinese embassy in your country or directly to the university. Direct university applications are usually less competitive.'
  },
  {
    id: 'daad-scholarships', name: 'DAAD Scholarships',
    provider: 'German Academic Exchange Service', scope: 'country', country: 'DE',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Monthly stipend plus travel and insurance; tuition is already free at public universities' },
    eligibility: { minIndex: 75, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'Varies by programme, typically autumn', renewable: true,
    link: 'https://daad.de',
    note: 'Undergraduate DAAD funding is limited — most programmes target master’s and doctoral study. Check the scholarship database for your country specifically.'
  },
  {
    id: 'deutschlandstipendium', name: 'Deutschlandstipendium',
    provider: 'German Federal Government and private sponsors', scope: 'country', country: 'DE',
    type: 'merit', coverage: 'partial',
    amount: { value: 3600, currency: 'EUR', period: 'year' },
    eligibility: { minIndex: 78, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'Set by each university, usually summer', renewable: true,
    link: 'https://deutschlandstipendium.de',
    note: '€300 a month regardless of nationality or family income, awarded by the university you attend. Half is funded by private sponsors, half by the federal government.'
  },
  {
    id: 'eiffel-excellence', name: 'Eiffel Excellence Scholarship',
    provider: 'French Ministry for Europe and Foreign Affairs', scope: 'country', country: 'FR',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Monthly allowance of €1,181, plus travel, insurance and cultural activities' },
    eligibility: { minIndex: 82, citizenship: 'non-eu', fields: null, level: 'master', needBased: false },
    deadline: 'January (nominated by the institution)', renewable: false,
    link: 'https://campusfrance.org',
    note: 'You cannot apply directly — your French institution must nominate you. Primarily a master’s programme, so plan for it as a next step rather than at bachelor entry.'
  },
  {
    id: 'holland-scholarship', name: 'Holland Scholarship',
    provider: 'Dutch Ministry of Education and participating universities', scope: 'country', country: 'NL',
    type: 'merit', coverage: 'partial',
    amount: { value: 5000, currency: 'EUR', period: 'first year only' },
    eligibility: { minIndex: 70, citizenship: 'non-eu', fields: null, level: 'bachelor', needBased: false },
    deadline: '1 February or 1 May depending on the university', renewable: false,
    link: 'https://studyinnl.org',
    note: 'A one-off first-year grant for non-EEA students. Small, but easy to apply for and stackable with university awards.'
  },
  {
    id: 'si-scholarships', name: 'Swedish Institute Scholarships for Global Professionals',
    provider: 'Swedish Institute', scope: 'country', country: 'SE',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, SEK 12,000 monthly living allowance, insurance and travel grant' },
    eligibility: { minIndex: 80, citizenship: 'developing', fields: null, level: 'master', needBased: false },
    deadline: 'February', renewable: true,
    link: 'https://si.se',
    note: 'Targeted at master’s applicants from a defined list of countries. Sweden has very little undergraduate funding for non-EU students, so plan bachelor costs in full.'
  },
  {
    id: 'danish-government-scholarship', name: 'Danish Government Scholarship',
    provider: 'Danish Ministry of Higher Education and Science', scope: 'country', country: 'DK',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Full or partial tuition waiver, occasionally with a living grant' },
    eligibility: { minIndex: 78, citizenship: 'non-eu', fields: null, level: 'bachelor', needBased: false },
    deadline: '15 March', renewable: true,
    link: 'https://studyindenmark.dk',
    note: 'Administered by each university from a government allocation. The number of awards is small, so apply in the Quota 2 round and make your motivation letter count.'
  },
  {
    id: 'finland-scholarship', name: 'Finland Scholarship',
    provider: 'Finnish Ministry of Education and Culture', scope: 'country', country: 'FI',
    type: 'merit', coverage: 'full',
    amount: { text: '100% first-year tuition waiver plus a €5,000 relocation grant' },
    eligibility: { minIndex: 75, citizenship: 'non-eu', fields: null, level: 'master', needBased: false },
    deadline: 'January (with your programme application)', renewable: false,
    link: 'https://studyinfinland.fi',
    note: 'Awarded automatically with admission to selected programmes — there is no separate application form.'
  },
  {
    id: 'ntnu-scholarship', name: 'Norwegian University Tuition Grants',
    provider: 'Norwegian universities', scope: 'country', country: 'NO',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Partial to full tuition waiver for non-EEA students' },
    eligibility: { minIndex: 78, citizenship: 'non-eu', fields: null, level: 'bachelor', needBased: false },
    deadline: '15 November', renewable: true,
    link: 'https://studyinnorway.no',
    note: 'Introduced after Norway began charging non-EEA tuition in 2023. Provision is still limited and varies sharply by institution.'
  },
  {
    id: 'swiss-government-excellence', name: 'Swiss Government Excellence Scholarship',
    provider: 'Swiss Confederation', scope: 'country', country: 'CH',
    type: 'merit', coverage: 'full',
    amount: { text: 'CHF 1,920 monthly stipend, tuition waiver, health insurance and housing allowance' },
    eligibility: { minIndex: 85, citizenship: 'any', fields: null, level: 'master', needBased: false },
    deadline: 'September–December depending on country', renewable: true,
    link: 'https://sbfi.admin.ch',
    note: 'Research and postgraduate level only. For bachelor study in Switzerland, budget for living costs — tuition itself is already very low.'
  },
  {
    id: 'oead-scholarships', name: 'OeAD Scholarships',
    provider: 'Austria’s Agency for Education and Internationalisation', scope: 'country', country: 'AT',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Monthly grant of €715–1,050 plus insurance' },
    eligibility: { minIndex: 74, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'Varies by programme', renewable: true,
    link: 'https://grants.at',
    note: 'A searchable database rather than a single award — filter by your nationality and field before applying.'
  },
  {
    id: 'nawa-banach', name: 'Stefan Banach Scholarship Programme',
    provider: 'NAWA — Polish National Agency for Academic Exchange', scope: 'country', country: 'PL',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition waiver plus PLN 1,700 monthly stipend' },
    eligibility: { minIndex: 72, citizenship: 'developing', fields: ['engineering', 'physical-sciences', 'life-sciences', 'environment', 'computer-science', 'business'], level: 'master', needBased: false },
    deadline: 'May', renewable: true,
    link: 'https://nawa.gov.pl',
    note: 'Aimed at applicants from Eastern Partnership, Balkan and developing countries, mainly in technical and economic subjects.'
  },
  {
    id: 'czech-government-scholarship', name: 'Czech Government Scholarship',
    provider: 'Czech Ministry of Education', scope: 'country', country: 'CZ',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, a monthly stipend and a year of Czech language preparation' },
    eligibility: { minIndex: 70, citizenship: 'developing', fields: null, level: 'bachelor', needBased: false },
    deadline: '30 September', renewable: true,
    link: 'https://mzv.cz',
    note: 'Includes a preparatory Czech course, after which your degree is free — Czech-taught study carries no tuition for anyone.'
  },
  {
    id: 'stipendium-hungaricum', name: 'Stipendium Hungaricum',
    provider: 'Hungarian Government', scope: 'country', country: 'HU',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, monthly stipend, accommodation contribution and medical insurance' },
    eligibility: { minIndex: 68, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'January', renewable: true,
    link: 'https://stipendiumhungaricum.hu',
    note: 'One of the largest fully funded undergraduate programmes in Europe, covering more than 90 partner countries — including English-taught medicine.'
  },
  {
    id: 'turkiye-burslari', name: 'Türkiye Bursları',
    provider: 'Republic of Türkiye', scope: 'country', country: 'TR',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, monthly stipend, accommodation, health insurance, flights and a year of Turkish language study' },
    eligibility: { minIndex: 70, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'February', renewable: true,
    link: 'https://turkiyeburslari.gov.tr',
    note: 'Genuinely comprehensive — it covers flights and a language year. Placement is decided by the programme, so you rank preferences rather than choosing outright.'
  },
  {
    id: 'vlir-uos', name: 'VLIR-UOS Scholarships',
    provider: 'Flemish Interuniversity Council', scope: 'country', country: 'BE',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, living allowance, travel and insurance' },
    eligibility: { minIndex: 72, citizenship: 'developing', fields: ['environment', 'life-sciences', 'medicine', 'engineering', 'social-sciences'], level: 'master', needBased: true },
    deadline: 'February–March', renewable: true,
    link: 'https://vliruos.be',
    note: 'For applicants from a defined list of partner countries, focused on development-relevant subjects.'
  },
  {
    id: 'mext-scholarship', name: 'MEXT Japanese Government Scholarship',
    provider: 'Japanese Ministry of Education', scope: 'country', country: 'JP',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, ¥117,000 monthly stipend, flights and a year of Japanese language study' },
    eligibility: { minIndex: 78, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'May–June (embassy route)', renewable: true,
    link: 'https://studyinjapan.go.jp',
    note: 'Apply through the Japanese embassy in your country. The undergraduate track includes a preparatory language year before your degree begins.'
  },
  {
    id: 'jasso-honors', name: 'JASSO Honors Scholarship',
    provider: 'Japan Student Services Organization', scope: 'country', country: 'JP',
    type: 'merit', coverage: 'partial',
    amount: { value: 576000, currency: 'JPY', period: 'year' },
    eligibility: { minIndex: 70, citizenship: 'any', fields: null, level: 'bachelor', needBased: true },
    deadline: 'Applied for through your university after enrolment', renewable: true,
    link: 'https://jasso.go.jp',
    note: '¥48,000 a month for privately financed international students already enrolled in Japan. Awarded on academic performance and financial need.'
  },
  {
    id: 'global-korea-scholarship', name: 'Global Korea Scholarship (GKS)',
    provider: 'Korean Government (NIIED)', scope: 'country', country: 'KR',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition, ₩900,000 monthly allowance, flights, insurance and a year of Korean language training' },
    eligibility: { minIndex: 76, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'September–October (embassy track)', renewable: true,
    link: 'https://studyinkorea.go.kr',
    note: 'Apply either through the Korean embassy or directly to a designated university. Requires a minimum 80% school average or equivalent.'
  },
  {
    id: 'taiwan-moe-scholarship', name: 'Taiwan MOE Scholarship',
    provider: 'Taiwanese Ministry of Education', scope: 'country', country: 'TW',
    type: 'merit', coverage: 'full',
    amount: { text: 'Up to NT$40,000 tuition per semester plus NT$15,000 monthly stipend' },
    eligibility: { minIndex: 70, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'February–March', renewable: true,
    link: 'https://studyintaiwan.org',
    note: 'Applied for through the Taiwanese representative office in your country. Separate Huayu Enrichment scholarships fund Mandarin study.'
  },
  {
    id: 'sg-moe-tuition-grant', name: 'MOE Tuition Grant (Singapore)',
    provider: 'Singapore Ministry of Education', scope: 'country', country: 'SG',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Reduces international tuition from roughly S$38,000 to S$19,000 a year' },
    eligibility: { minIndex: 74, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'Applied for with your admission offer', renewable: true,
    link: 'https://moe.gov.sg',
    note: 'The catch is a binding three-year obligation to work for a Singapore-registered company after graduation. That is a real commitment, not a formality.'
  },
  {
    id: 'hk-belt-road', name: 'Belt and Road Scholarship',
    provider: 'Hong Kong Government', scope: 'country', country: 'HK',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full tuition for the normal duration of the programme' },
    eligibility: { minIndex: 80, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'Applied for with university admission', renewable: true,
    link: 'https://cspe.edb.hksar.gov.hk',
    note: 'Country-specific quotas for students from Belt and Road partner nations, awarded alongside your university offer.'
  },
  {
    id: 'mastercard-foundation', name: 'Mastercard Foundation Scholars Program',
    provider: 'Mastercard Foundation', scope: 'global', country: null,
    type: 'need-and-merit', coverage: 'full',
    amount: { text: 'Full tuition, accommodation, books, travel and a living stipend' },
    eligibility: { minIndex: 74, citizenship: 'developing', fields: null, level: 'bachelor', needBased: true },
    deadline: 'Varies by partner university', renewable: true,
    link: 'https://mastercardfdn.org',
    note: 'Runs at partner universities across Africa, North America and Europe. Explicitly targets academically strong students with limited financial means.'
  },
  {
    id: 'dsu-italy', name: 'DSU Regional Right-to-Study Grant',
    provider: 'Italian regional authorities', scope: 'country', country: 'IT',
    type: 'need', coverage: 'full',
    amount: { text: 'Tuition waiver, meal card, accommodation and a cash grant of €2,000–7,000' },
    eligibility: { minIndex: 55, citizenship: 'any', fields: null, level: 'bachelor', needBased: true },
    deadline: 'August–September', renewable: true,
    link: 'https://universitaly.it',
    note: 'Purely income-based and open to international students on the same terms as Italians. You need an ISEE Parificato assessment of your family income.'
  },
  {
    id: 'dsu-lombardia', name: 'Diritto allo Studio Lombardia',
    provider: 'Regione Lombardia', scope: 'country', country: 'IT',
    type: 'need', coverage: 'full',
    amount: { text: 'Tuition exemption, housing and up to €7,000 in cash support' },
    eligibility: { minIndex: 55, citizenship: 'any', fields: null, level: 'bachelor', needBased: true },
    deadline: 'August', renewable: true,
    link: 'https://polimi.it',
    note: 'The Lombardy version of the DSU grant, covering Politecnico di Milano and Bocconi students. Requires the ISEE income assessment.'
  },
  {
    id: 'ile-de-france-grant', name: 'Île-de-France Mobility Grant',
    provider: 'Région Île-de-France', scope: 'country', country: 'FR',
    type: 'need', coverage: 'partial',
    amount: { value: 3000, currency: 'EUR', period: 'year' },
    eligibility: { minIndex: 60, citizenship: 'any', fields: null, level: 'bachelor', needBased: true },
    deadline: 'Varies by institution', renewable: true,
    link: 'https://iledefrance.fr',
    note: 'Regional support for students in the Paris area, on top of the very low public tuition.'
  },
  {
    id: 'quebec-merit', name: 'Quebec Tuition Exemption for International Students',
    provider: 'Gouvernement du Québec', scope: 'country', country: 'CA',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Reduces international fees to the Quebec resident rate — a saving of over C$20,000 a year' },
    eligibility: { minIndex: 70, citizenship: ['FR', 'BE'], fields: null, level: 'bachelor', needBased: false },
    deadline: 'Applied for with admission', renewable: true,
    link: 'https://quebec.ca',
    note: 'Bilateral agreements give French and Belgian citizens near-domestic fees at Quebec universities. Other nationalities have a smaller exemption programme.'
  },
  {
    id: 'shanghai-government-scholarship', name: 'Shanghai Government Scholarship',
    provider: 'Shanghai Municipal Education Commission', scope: 'country', country: 'CN',
    type: 'merit', coverage: 'full',
    amount: { text: 'Full or partial tuition, accommodation, insurance and a living stipend' },
    eligibility: { minIndex: 72, citizenship: 'any', fields: null, level: 'bachelor', needBased: false },
    deadline: 'March–May', renewable: true,
    link: 'https://study-shanghai.org',
    note: 'A city-level alternative to the national CSC award, applied for directly through Shanghai universities.'
  },
  {
    id: 'iit-dasa-merit', name: 'DASA Merit Scholarship',
    provider: 'Indian Ministry of Education', scope: 'country', country: 'IN',
    type: 'merit', coverage: 'partial',
    amount: { text: 'Tuition reduction of 25–50% for high-ranking DASA candidates' },
    eligibility: { minIndex: 80, citizenship: 'any', fields: ['engineering', 'computer-science', 'physical-sciences'], level: 'bachelor', needBased: false },
    deadline: 'April–May', renewable: true,
    link: 'https://dasanit.org',
    note: 'For international and NRI students entering the IITs and NITs through the Direct Admission of Students Abroad channel.'
  }
];
