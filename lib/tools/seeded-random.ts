/**
 * Small, deterministic PRNG utilities shared by the creative "generator" tools
 * (aesthetic emoji/username, animal fusion, blob shapes, book titles, character
 * traits, postal-code-style test data, etc). Using a single seedable generator
 * across all of them means every one of those tools can produce reproducible
 * output for a given seed (needed for deterministic tests) while still
 * defaulting to genuine randomness for normal, interactive use.
 *
 * Algorithm: mulberry32 - a tiny, fast 32-bit PRNG. It is not cryptographically
 * secure and must never be used for anything security-sensitive (passwords,
 * tokens, UUIDs); it exists purely to make "random-looking" creative output
 * reproducible on demand.
 */

export type Rng = () => number;

/** Creates a seeded PRNG that returns floats in [0, 1), same sequence for the same seed. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh, non-deterministic seed for normal interactive use (not for security purposes). */
export function randomSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }
  return Math.floor(Date.now() % 4294967296);
}

/** Random integer in [min, max] inclusive, using the given rng. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Random float in [min, max), using the given rng. */
export function randomFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/** Picks one random element from a non-empty array. */
export function pickRandom<T>(rng: Rng, arr: readonly T[]): T {
  return arr[randomInt(rng, 0, arr.length - 1)];
}

/** Picks `count` distinct random elements from an array (no repeats), order randomized. */
export function pickUnique<T>(rng: Rng, arr: readonly T[], count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = randomInt(rng, 0, pool.length - 1);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
