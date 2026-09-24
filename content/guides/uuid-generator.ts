import type { RichGuide } from './types';

const guide: RichGuide = {
  slug: 'uuid-generator',
  intro:
    'A UUID (universally unique identifier) is a 128-bit value designed so that two independently generated ids are, for all practical purposes, guaranteed not to collide - no coordination or central registry required. This guide covers the version 4 (random) format this tool generates and why collisions are effectively impossible.',
  sections: [
    {
      heading: 'Anatomy of a version 4 UUID',
      blocks: [
        {
          type: 'code',
          language: 'text',
          code: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
        },
        {
          type: 'list',
          items: [
            '32 hex digits total, grouped into 5 dash-separated sections (8-4-4-4-12), 128 bits of raw data.',
            'The character shown as "4" is fixed - it marks this as version 4 (randomly generated), as opposed to version 1 (timestamp+MAC-based), 3/5 (name-based hashes), or 7 (timestamp-ordered, increasingly common for database keys).',
            'The character shown as "y" is constrained to 8, 9, a, or b - this is the variant bits (RFC 4122), which take up 2 of that character\'s 4 bits, leaving 2 random bits there.',
            'Every other "x" is a fully random hex digit (4 random bits each).',
          ],
        },
        {
          type: 'paragraph',
          text: 'Out of 128 total bits, 6 are fixed (4 for the version nibble, 2 for the variant bits), leaving 122 bits of actual randomness - roughly 5.3 x 10^36 possible values.',
        },
      ],
    },
    {
      heading: 'Why collisions are effectively impossible',
      blocks: [
        {
          type: 'paragraph',
          text: 'The relevant question isn\'t "could two random UUIDs ever be equal" (mathematically, yes, with vanishing probability) but "how many would I have to generate before a collision becomes likely" - this is the classic birthday-problem calculation.',
        },
        {
          type: 'formula',
          formula: 'p ~ 1 - e^(-n^2 / (2N))',
          legend: [
            { symbol: 'n', meaning: 'number of UUIDs generated' },
            { symbol: 'N', meaning: 'total possible values = 2^122 (the random bits in a v4 UUID)' },
            { symbol: 'p', meaning: 'approximate probability that at least two of the n UUIDs collide' },
          ],
        },
        {
          type: 'example',
          title: 'Collision probability after generating 1 billion UUIDs',
          steps: [
            'n = 1,000,000,000 (10^9), so n^2 = 10^18',
            'N = 2^122 ~ 5.3169 x 10^36, so 2N ~ 1.0634 x 10^37',
            'n^2 / (2N) = 10^18 / 1.0634 x 10^37 ~ 9.4 x 10^-20',
            'p ~ 1 - e^(-9.4x10^-20), which for such a tiny exponent is essentially equal to 9.4 x 10^-20 itself',
            'Result: after generating one billion v4 UUIDs, the chance any two of them match is roughly 1 in 10^19 - vastly smaller than, for comparison, the odds of a specific person being struck by lightning this year (roughly 1 in a million).',
          ],
        },
        {
          type: 'note',
          text: 'This calculation assumes a cryptographically sound random source, which is what this tool and modern language UUID libraries use (crypto.getRandomValues in the browser). A UUID generated from a weak or predictable random source loses these guarantees regardless of the version number.',
        },
      ],
    },
    {
      heading: 'When to use v4 vs. other UUID versions',
      blocks: [
        {
          type: 'table',
          headers: ['Version', 'Based on', 'Good for'],
          rows: [
            ['v4', 'Pure randomness', 'General-purpose ids with no ordering requirement - the most common choice'],
            ['v1', 'Timestamp + MAC address', 'Legacy systems that need rough time-ordering; leaks host MAC and generation time'],
            ['v5', 'SHA-1 hash of a namespace + name', 'Deterministic ids - the same input always produces the same UUID'],
            ['v7', 'Unix timestamp (ms) + random bits', 'Database primary keys - sorts naturally by creation time while staying random enough to avoid guessing'],
          ],
        },
      ],
    },
  ],
};

export default guide;
