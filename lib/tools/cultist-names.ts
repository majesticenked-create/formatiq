/**
 * Original dark-fantasy/occult-FICTION name generator for creative writing.
 * Every word list below is invented for this tool - no real-world religion,
 * faith, ethnic group, extremist or criminal organization, or copyrighted
 * franchise is referenced, named, or imitated. There is no ritual,
 * recruitment, or how-to content here; this produces name strings only,
 * for use as placeholder names in fiction, tabletop games, or worldbuilding.
 */

import { type Rng, pickRandom } from './seeded-random';

// Invented syllable fragments - not drawn from any real language or liturgy.
const NAME_PREFIXES = [
  'Mor', 'Vael', 'Threx', 'Ashen', 'Null', 'Grim', 'Vex', 'Ebon', 'Hollow', 'Wyr',
  'Dask', 'Oru', 'Vash', 'Nyr', 'Quor', 'Sable', 'Drev', 'Kael', 'Thorn', 'Umbr',
];
const NAME_MIDDLES = ['a', 'o', 'e', 'i', 'u', 'ae', 'or', 'an', 'ith', 'ul'];
const NAME_SUFFIXES = [
  'wyn', 'dra', 'thos', 'mir', 'keth', 'vane', 'dor', 'rix', 'lume', 'gath',
  'ssa', 'vor', 'reth', 'lok', 'zan', 'quel', 'morn', 'thal', 'vyx', 'oden',
];

// Fictional titles - generic archetypes, not tied to any real-world office or rite.
const TITLES = [
  'the Unseen', 'of the Ash Vigil', 'the Hollow-Eyed', 'of the Last Ember',
  'the Quiet Oath', 'of the Deep Hush', 'the Pale Warden', 'of the Broken Star',
  'the Ninth Candle', 'of the Severed Veil', 'the Grey Augur', 'of the Wandering Flame',
];

// Fictional order/group name components - original invented words only.
const ORDER_PREFIXES = [
  'Order of the', 'Circle of the', 'Cult of the', 'Covenant of the',
  'Brotherhood of the', 'Choir of the', 'Assembly of the', 'Court of the',
];
const ORDER_NOUNS = [
  'Ashen Veil', 'Hollow Moon', 'Severed Star', 'Quiet Flame', 'Last Ember',
  'Broken Hourglass', 'Pale Thorn', 'Drowned Candle', 'Unseen Root', 'Grey Lantern',
  'Withered Crown', 'Ninth Shadow',
];

export interface CultistName {
  name: string;
  title: string;
}

/** Generates one invented personal name, e.g. "Vaelomir". */
export function generateCultistPersonalName(rng: Rng): string {
  return pickRandom(rng, NAME_PREFIXES) + pickRandom(rng, NAME_MIDDLES) + pickRandom(rng, NAME_SUFFIXES);
}

/** Generates a name plus a fictional honorific/title, e.g. "Vaelomir, the Hollow-Eyed". */
export function generateCultistNameWithTitle(rng: Rng): CultistName {
  return { name: generateCultistPersonalName(rng), title: pickRandom(rng, TITLES) };
}

/** Generates an invented fictional order/group name, e.g. "Order of the Ashen Veil". */
export function generateCultistOrderName(rng: Rng): string {
  return `${pickRandom(rng, ORDER_PREFIXES)} ${pickRandom(rng, ORDER_NOUNS)}`;
}
