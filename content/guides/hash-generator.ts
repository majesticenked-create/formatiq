import type { RichGuide } from './types';

const guide: RichGuide = {
  slug: 'hash-generator',
  intro:
    'A hash function takes input of any length and produces a fixed-length "fingerprint" of it - the same input always produces the same output, but there is no way to reverse the output back into the input. This guide covers what each algorithm this tool supports is actually for, with a verified worked example.',
  sections: [
    {
      heading: 'What a hash is (and is not)',
      blocks: [
        {
          type: 'list',
          items: [
            'Deterministic: hashing the same input twice always gives the same output.',
            'Fixed-length output: MD5 always outputs 128 bits (32 hex characters) regardless of whether the input is 3 bytes or 3 gigabytes; SHA-256 always outputs 256 bits (64 hex characters).',
            'One-way: there is no algorithm to recover the original input from the hash alone - the only general approach is guessing inputs and re-hashing them to see if they match.',
            'Avalanche effect: changing a single character of the input produces a completely different-looking hash, not a similar one.',
          ],
        },
        {
          type: 'note',
          text: 'Hashing is not encryption. Encryption is reversible with the right key; hashing is deliberately one-way. That is exactly why hashes are used for password storage and integrity checks - the system checking the hash never needs to recover the original value.',
        },
      ],
    },
    {
      heading: 'Worked example: hashing the same input four ways',
      blocks: [
        {
          type: 'paragraph',
          text: 'Input text: "Formatiq makes dev tools fast." - hashed with each algorithm this tool supports (values computed and verified independently, not just illustrative):',
        },
        {
          type: 'table',
          headers: ['Algorithm', 'Output length', 'Hash (hex)'],
          rows: [
            ['MD5', '128 bits / 32 hex chars', '74f0b219b39d4786a14012a3c35cb271'],
            ['SHA-1', '160 bits / 40 hex chars', '4507be762d492b705741022e4b9e8d894ef97468'],
            ['SHA-256', '256 bits / 64 hex chars', 'a294309c79ea10cdbc9bda5438c672fee7a14a792f7bed8f02a3e42bef774393'],
            ['SHA-512', '512 bits / 128 hex chars', 'ec3abdd29774c4c2dc2b82ec5d11f844530e3508d11a0c27b63157294506ea867a2dcddd33afaef3e2b7d560e264b41c044274e1b72a3180bb6e634919e22ee7'],
          ],
        },
        {
          type: 'note',
          text: 'Notice the output length never changes with input length - hashing one character or one megabyte of text through SHA-256 always produces exactly 64 hex characters.',
        },
      ],
    },
    {
      heading: 'Which algorithm to use',
      blocks: [
        {
          type: 'table',
          headers: ['Algorithm', 'Status', 'Use it for'],
          rows: [
            ['MD5', 'Broken for security use (collisions are practical to engineer)', 'Non-security checksums only - e.g. quickly checking if a downloaded file matches a known-good copy'],
            ['SHA-1', 'Broken for security use (collisions demonstrated in practice since 2017)', 'Legacy compatibility only (e.g. git object ids) - do not use for new security-sensitive work'],
            ['SHA-256', 'Currently considered secure', 'General-purpose integrity checks, digital signatures, blockchain, most new applications'],
            ['SHA-512', 'Currently considered secure', 'Same use cases as SHA-256, with a larger output; can be faster on 64-bit hardware'],
          ],
        },
        {
          type: 'note',
          text: 'None of these algorithms are appropriate for hashing passwords directly, "broken" or not - password hashing needs a deliberately slow, salted algorithm (bcrypt, scrypt, or Argon2) specifically designed to resist brute-force guessing, which general-purpose hashes like these are not.',
        },
      ],
    },
  ],
};

export default guide;
