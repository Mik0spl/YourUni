/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node tools/import/eurostat.mjs <dir> --json eurostat.json
 *   node tools/import/generate.mjs eurostat.json uk-institutions.json
 *
 * National education and labour-market figures from Eurostat, merged into the
 * country reference data at load time.
 *
 *   graduateEmployment  employment rate of recent graduates (ISCED 3-8, 20-34,
 *                       1-3 years after leaving education), % — dataset tps00053
 *   neetRate            young people not in employment, education or training,
 *                       15-29, % of population — dataset tipslm90
 *   earlyLeavers        early leavers from education and training, 18-24, %
 *                       — dataset sdg_04_10
 *
 * Each figure carries the year it is from. UK figures stop at 2019, when the UK
 * left Eurostat reporting.
 *
 * Source: https://ec.europa.eu/eurostat/databrowser/
 */
export const countryStats = {
  AT: { graduateEmployment: 87.9, graduateEmploymentYear: 2025, neetRate: 10.3, neetRateYear: 2025, earlyLeavers: 10, earlyLeaversYear: 2025 },
  BA: { graduateEmployment: 58.7, graduateEmploymentYear: 2025, earlyLeavers: 3, earlyLeaversYear: 2025 },
  BE: { graduateEmployment: 82.9, graduateEmploymentYear: 2025, neetRate: 9.8, neetRateYear: 2025, earlyLeavers: 7.3, earlyLeaversYear: 2025 },
  BG: { graduateEmployment: 81.2, graduateEmploymentYear: 2025, neetRate: 13.8, neetRateYear: 2025, earlyLeavers: 8.6, earlyLeaversYear: 2025 },
  CH: { graduateEmployment: 86.2, graduateEmploymentYear: 2025, earlyLeavers: 5.5, earlyLeaversYear: 2025 },
  CY: { graduateEmployment: 82.3, graduateEmploymentYear: 2025, neetRate: 10.6, neetRateYear: 2025, earlyLeavers: 9.8, earlyLeaversYear: 2025 },
  CZ: { graduateEmployment: 86.5, graduateEmploymentYear: 2025, neetRate: 8, neetRateYear: 2025, earlyLeavers: 6.1, earlyLeaversYear: 2025 },
  DE: { graduateEmployment: 90.6, graduateEmploymentYear: 2025, neetRate: 9.5, neetRateYear: 2025, earlyLeavers: 13.1, earlyLeaversYear: 2025 },
  DK: { graduateEmployment: 85.5, graduateEmploymentYear: 2025, neetRate: 8.9, neetRateYear: 2025, earlyLeavers: 10, earlyLeaversYear: 2025 },
  EE: { graduateEmployment: 81, graduateEmploymentYear: 2025, neetRate: 11.2, neetRateYear: 2025, earlyLeavers: 10.2, earlyLeaversYear: 2025 },
  GR: { graduateEmployment: 62.4, graduateEmploymentYear: 2025, neetRate: 13.5, neetRateYear: 2025, earlyLeavers: 3, earlyLeaversYear: 2025 },
  ES: { graduateEmployment: 81.3, graduateEmploymentYear: 2025, neetRate: 11.5, neetRateYear: 2025, earlyLeavers: 12.8, earlyLeaversYear: 2025 },
  FI: { graduateEmployment: 79.5, graduateEmploymentYear: 2025, neetRate: 11, neetRateYear: 2025, earlyLeavers: 9.9, earlyLeaversYear: 2025 },
  FR: { graduateEmployment: 77.8, graduateEmploymentYear: 2025, neetRate: 12.9, neetRateYear: 2025, earlyLeavers: 7.2, earlyLeaversYear: 2025 },
  HR: { graduateEmployment: 78.1, graduateEmploymentYear: 2025, neetRate: 10.8, neetRateYear: 2025, earlyLeavers: 2.1, earlyLeaversYear: 2025 },
  HU: { graduateEmployment: 86.7, graduateEmploymentYear: 2025, neetRate: 10.6, neetRateYear: 2025, earlyLeavers: 9.3, earlyLeaversYear: 2025 },
  IE: { graduateEmployment: 89.1, graduateEmploymentYear: 2025, neetRate: 8.1, neetRateYear: 2025, earlyLeavers: 3.6, earlyLeaversYear: 2025 },
  IS: { graduateEmployment: 91.4, graduateEmploymentYear: 2025, earlyLeavers: 16.7, earlyLeaversYear: 2025 },
  IT: { graduateEmployment: 71.8, graduateEmploymentYear: 2025, neetRate: 13.3, neetRateYear: 2025, earlyLeavers: 8.2, earlyLeaversYear: 2025 },
  LT: { graduateEmployment: 86.4, graduateEmploymentYear: 2025, neetRate: 12.4, neetRateYear: 2025, earlyLeavers: 5.9, earlyLeaversYear: 2025 },
  LU: { graduateEmployment: 84.7, graduateEmploymentYear: 2025, neetRate: 8.7, neetRateYear: 2025, earlyLeavers: 7.8, earlyLeaversYear: 2024 },
  LV: { graduateEmployment: 83.1, graduateEmploymentYear: 2025, neetRate: 11, neetRateYear: 2025, earlyLeavers: 8.8, earlyLeaversYear: 2025 },
  ME: { graduateEmployment: 54.1, graduateEmploymentYear: 2020, earlyLeavers: 3.6, earlyLeaversYear: 2020 },
  MK: { graduateEmployment: 58.9, graduateEmploymentYear: 2025, earlyLeavers: 9.5, earlyLeaversYear: 2025 },
  MT: { graduateEmployment: 91, graduateEmploymentYear: 2025, neetRate: 8.5, neetRateYear: 2025, earlyLeavers: 8.6, earlyLeaversYear: 2025 },
  NL: { graduateEmployment: 90.1, graduateEmploymentYear: 2025, neetRate: 5.3, neetRateYear: 2025, earlyLeavers: 7.4, earlyLeaversYear: 2025 },
  NO: { graduateEmployment: 88.6, graduateEmploymentYear: 2025, earlyLeavers: 3.8, earlyLeaversYear: 2025 },
  PL: { graduateEmployment: 84.6, graduateEmploymentYear: 2025, neetRate: 9.2, neetRateYear: 2025, earlyLeavers: 4, earlyLeaversYear: 2025 },
  PT: { graduateEmployment: 82.2, graduateEmploymentYear: 2025, neetRate: 8, neetRateYear: 2025, earlyLeavers: 6.1, earlyLeaversYear: 2025 },
  RO: { graduateEmployment: 72.7, graduateEmploymentYear: 2025, neetRate: 19.2, neetRateYear: 2025, earlyLeavers: 15.5, earlyLeaversYear: 2025 },
  RS: { graduateEmployment: 70.1, graduateEmploymentYear: 2025, earlyLeavers: 5.1, earlyLeaversYear: 2025 },
  SE: { graduateEmployment: 87, graduateEmploymentYear: 2025, neetRate: 5.9, neetRateYear: 2025, earlyLeavers: 6.7, earlyLeaversYear: 2025 },
  SI: { graduateEmployment: 84.7, graduateEmploymentYear: 2025, neetRate: 7.6, neetRateYear: 2025, earlyLeavers: 5.5, earlyLeaversYear: 2025 },
  SK: { graduateEmployment: 84.8, graduateEmploymentYear: 2025, neetRate: 11.1, neetRateYear: 2025, earlyLeavers: 6.8, earlyLeaversYear: 2025 },
  TR: { graduateEmployment: 64, graduateEmploymentYear: 2025, earlyLeavers: 17.9, earlyLeaversYear: 2025 },
  GB: { graduateEmployment: 85.4, graduateEmploymentYear: 2019, earlyLeavers: 10.9, earlyLeaversYear: 2019 }
};

export const COUNTRY_STATS_SOURCE = 'Eurostat (tps00053, tipslm90, sdg_04_10)';
