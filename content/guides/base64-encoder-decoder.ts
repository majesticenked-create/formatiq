import type { RichGuide } from './types';

const guide: RichGuide = {
  slug: 'base64-encoder-decoder',
  intro:
    'Base64 turns arbitrary binary data into plain ASCII text, which is why it shows up everywhere from email attachments to embedded images to API auth headers. Here is exactly how the encoding works and why the output looks the way it does.',
  sections: [
    {
      heading: 'How the encoding works',
      blocks: [
        {
          type: 'paragraph',
          text: 'Base64 re-groups input data from 8-bit bytes into 6-bit chunks, since 6 bits is exactly enough to index into a 64-character alphabet (A-Z, a-z, 0-9, +, /). Three input bytes (24 bits) divide evenly into four 6-bit groups, which is why base64 output is always a multiple of 4 characters, and why encoded data is roughly 4/3 (about 33%) larger than the original.',
        },
        {
          type: 'formula',
          formula: 'output_length = ceil(input_bytes / 3) x 4',
          legend: [
            { symbol: 'input_bytes', meaning: 'length of the original data, in bytes' },
            { symbol: 'ceil(...)', meaning: 'round up to the next whole number of 3-byte groups' },
            { symbol: 'output_length', meaning: 'length of the resulting base64 string, in characters (including padding)' },
          ],
        },
        {
          type: 'heading',
          text: 'Why the trailing = signs appear',
        },
        {
          type: 'paragraph',
          text: 'When the input length is not a multiple of 3 bytes, the last group is padded with zero bits to fill out to 6-bit boundaries, and the output is padded with = characters to keep the total length a multiple of 4. One leftover byte produces two = signs; two leftover bytes produce one.',
        },
      ],
    },
    {
      heading: 'Worked example',
      blocks: [
        {
          type: 'example',
          title: 'Encoding the 3-letter string "Man"',
          steps: [
            'ASCII bytes: M = 77 = 01001101, a = 97 = 01100001, n = 110 = 01101110',
            'Concatenated as 24 bits: 010011 010110 000101 101110',
            'Each 6-bit group is read as a number 0-63 and mapped to the base64 alphabet: 010011 = 19 -> "T", 010110 = 22 -> "W", 000101 = 5 -> "F", 101110 = 46 -> "u"',
            'Result: "TWFu" - exactly 4 characters, no padding needed, because 3 input bytes divide evenly.',
          ],
        },
        {
          type: 'example',
          title: 'Encoding the 2-letter string "Ma" (padding case)',
          steps: [
            'ASCII bytes: M = 77 = 01001101, a = 97 = 01100001 (only 16 bits total, one byte short of a full 3-byte group)',
            'The bits are grouped as 010011 010110 0001(00) - the last group is padded on the right with two zero bits to reach 6 bits',
            'Mapped to the alphabet: 010011 = 19 -> "T", 010110 = 22 -> "W", 000100 = 4 -> "E"',
            'Result: "TWE=" - one padding character, because one byte (8 bits) was short of the next full 3-byte group.',
          ],
        },
      ],
    },
    {
      heading: 'Base64 is not encryption',
      blocks: [
        {
          type: 'note',
          text: 'Base64 is a reversible, publicly known encoding, not a cipher - anyone can decode it instantly with no key. It is used to make binary-safe data survive text-only channels (JSON fields, URLs, email bodies), never to keep data confidential. Don\'t rely on it to hide sensitive values like passwords or tokens.',
        },
        {
          type: 'table',
          headers: ['Variant', 'Where it differs', 'Typical use'],
          rows: [
            ['Standard', 'Uses + and / in the alphabet', 'General text/JSON/email use'],
            ['URL-safe', 'Uses - and _ instead of + and /, often omits = padding', 'Embedding data directly in a URL or filename'],
            ['MIME', 'Standard alphabet, but inserts line breaks every 76 characters', 'Email attachment bodies (RFC 2045)'],
          ],
        },
      ],
    },
  ],
};

export default guide;
