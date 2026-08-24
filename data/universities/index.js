/**
 * Every university on the site, assembled from the regional files.
 *
 * TO ADD UNIVERSITIES: create a new file in this folder that exports a
 * `universities` array, then import it below and spread it into the list.
 * Nothing else in the codebase needs to change.
 */
import { universities as unitedStates } from './united-states.js';
import { universities as canada } from './canada.js';
import { universities as unitedKingdomIreland } from './united-kingdom-ireland.js';
import { universities as europeWest } from './europe-west.js';
import { universities as europeNordic } from './europe-nordic.js';
import { universities as europeSouthCentral } from './europe-south-central.js';
import { universities as asia } from './asia.js';
import { universities as oceaniaAndRest } from './oceania-and-rest.js';

export const universities = [
  ...unitedStates,
  ...canada,
  ...unitedKingdomIreland,
  ...europeWest,
  ...europeNordic,
  ...europeSouthCentral,
  ...asia,
  ...oceaniaAndRest
];
