/**
 * Every scholarship on the site.
 *
 * TO ADD SCHOLARSHIPS: create a file here exporting a `scholarships` array,
 * import it below and spread it in.
 */
import { scholarships as globalProgrammes } from './global.js';
import { scholarships as universityAwards } from './university-awards.js';
import { scholarships as universityAwardsWorld } from './university-awards-world.js';

export const scholarships = [
  ...globalProgrammes,
  ...universityAwards,
  ...universityAwardsWorld
];
