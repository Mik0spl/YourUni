/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node tools/import/discoveruni.mjs <csv-dir> --json uk-institutions.json
 *   node tools/import/generate.mjs eurostat.json uk-institutions.json
 *
 * Real published outcomes for UK universities, merged onto their records at load
 * time. Everything here is measured and attributable — none of it is estimated.
 *
 *   employmentPct       graduates in work and/or further study 15 months after
 *                       finishing, %
 *   medianSalary3yr     median earnings 3 years after graduating, GBP (LEO)
 *   satisfactionPct     mean positivity across NSS 2024-25 questions, %
 *   continuationPct     students continuing into their second year, %
 *   meanTariff          population-weighted mean UCAS tariff of entrants
 *   shareTariff144Plus  share of entrants holding AAA or better, %
 *   shareTariff160Plus  share of entrants holding A*A*A or better, %
 *   tef                 Teaching Excellence Framework overall rating
 *
 * Note there is deliberately no acceptance rate here. Discover Uni does not
 * publish one, and it cannot be derived from tariff: LSE and Bristol share a mean
 * tariff of 155 yet admit 11% and 45% of applicants respectively.
 *
 * Source: Discover Uni / HESA / Office for Students, dataset dated 2026-08-18.
 * https://www.discoveruni.gov.uk/about-our-data/
 */
export const ukOutcomes = {
  oxford: { ukprn: "10007774", employmentPct: 85.8, medianSalary3yr: 33006, satisfactionPct: 84.2, continuationPct: 97.2, meanTariff: 169.3, shareTariff144Plus: 81.3, shareTariff160Plus: 64.4, tef: "Gold" },
  cambridge: { ukprn: "10007788", employmentPct: 85.4, medianSalary3yr: 35448, satisfactionPct: 84.4, continuationPct: 98.4, tef: "Gold" },
  imperial: { ukprn: "10003270", employmentPct: 92, medianSalary3yr: 43785, satisfactionPct: 84.4, continuationPct: 92.7, tef: "Gold" },
  ucl: { ukprn: "10007784", employmentPct: 85.8, medianSalary3yr: 32425, satisfactionPct: 82.9, continuationPct: 89.8, meanTariff: 153.4, shareTariff144Plus: 61.7, shareTariff160Plus: 37.1, tef: "Silver" },
  lse: { ukprn: "10004063", employmentPct: 90.4, medianSalary3yr: 43149, satisfactionPct: 83.1, continuationPct: 95.5, meanTariff: 155, shareTariff144Plus: 69, shareTariff160Plus: 42.1, tef: "Silver" },
  edinburgh: { ukprn: "10007790", employmentPct: 87.7, medianSalary3yr: 28370, satisfactionPct: 76.6, continuationPct: 92.3, meanTariff: 162.6, shareTariff144Plus: 69.6, shareTariff160Plus: 48.6 },
  kcl: { ukprn: "10003645", employmentPct: 84.6, medianSalary3yr: 34361, satisfactionPct: 82.5, continuationPct: 91.1, meanTariff: 143.4, shareTariff144Plus: 46.3, shareTariff160Plus: 20.3, tef: "Silver" },
  warwick: { ukprn: "10007163", employmentPct: 88.8, medianSalary3yr: 33322, satisfactionPct: 86.5, continuationPct: 94.4, meanTariff: 152.7, shareTariff144Plus: 57.8, shareTariff160Plus: 34.6, tef: "Gold" },
  standrews: { ukprn: "10007803", employmentPct: 87.6, medianSalary3yr: 29700, satisfactionPct: 89.6, continuationPct: 95.2 },
  manchester: { ukprn: "10007798", employmentPct: 84.6, medianSalary3yr: 27944, satisfactionPct: 82.2, continuationPct: 91, meanTariff: 147.4, shareTariff144Plus: 52.2, shareTariff160Plus: 28.1, tef: "Silver" },
  bristol: { ukprn: "10007786", employmentPct: 85.6, medianSalary3yr: 33804, satisfactionPct: 83, continuationPct: 91.6, meanTariff: 155, shareTariff144Plus: 64.2, shareTariff160Plus: 39.3, tef: "Silver" },
  durham: { ukprn: "10007143", employmentPct: 85.6, medianSalary3yr: 32561, satisfactionPct: 86.2, continuationPct: 94.8, meanTariff: 157.2, shareTariff144Plus: 63.6, shareTariff160Plus: 41.8, tef: "Silver" }
};

export const UK_OUTCOMES_SOURCE = 'Discover Uni (HESA / Office for Students), August 2026';
