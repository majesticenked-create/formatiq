import type { RichGuide } from './types';

const guide: RichGuide = {
  slug: 'regex-tester',
  intro:
    'A regular expression is a pattern that describes text to match, search, or extract from - one compact syntax instead of hand-written character-by-character logic. This guide covers the core syntax and two verified worked examples.',
  sections: [
    {
      heading: 'Core syntax reference',
      blocks: [
        {
          type: 'table',
          headers: ['Token', 'Matches'],
          rows: [
            ['.', 'Any single character except a newline'],
            ['\\d / \\w / \\s', 'A digit / a word character (letter, digit, underscore) / a whitespace character'],
            ['\\D / \\W / \\S', 'The negation of the above - anything that is not a digit / word char / whitespace'],
            ['*  /  +  /  ?', 'The preceding token 0-or-more / 1-or-more / 0-or-1 times'],
            ['{n}  /  {n,m}', 'The preceding token exactly n times / between n and m times'],
            ['[abc]  /  [^abc]', 'Any one character in the set / any one character not in the set'],
            ['(...)', 'A capturing group - the matched text is extracted separately'],
            ['^  /  $', 'Start of the string (or line, in multiline mode) / end of the string (or line)'],
            ['|', 'Alternation - matches whichever side is present ("cat|dog" matches "cat" or "dog")'],
          ],
        },
      ],
    },
    {
      heading: 'Worked example: a basic email pattern',
      blocks: [
        {
          type: 'code',
          language: 'regex',
          code: '^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$',
        },
        {
          type: 'list',
          items: [
            '^ and $ anchor the match to the whole string, not just a substring somewhere inside it.',
            '[\\w.+-]+ matches one or more word characters, dots, plus signs, or hyphens - the local part before the @.',
            '@ matches a literal @ character.',
            '[\\w-]+ matches the domain name (letters, digits, underscore, hyphen).',
            '\\.[a-zA-Z]{2,} matches a literal dot followed by a 2-or-more letter TLD (.com, .io, .co, etc).',
          ],
        },
        {
          type: 'example',
          title: 'Testing this pattern against two strings',
          steps: [
            'Input "ada@example.com" against ^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$ -> matches (verified: local part "ada", domain "example", TLD "com" all satisfy their respective groups)',
            'Input "not-an-email" against the same pattern -> no match, because there is no @ character at all for the pattern to anchor on',
          ],
        },
        {
          type: 'note',
          text: 'This pattern is intentionally simple and rejects some technically valid addresses (e.g. quoted local parts, IP-address domains) while accepting some invalid-looking ones. Real email validation is notoriously hard to do with a single regex - most production systems combine a permissive pattern like this with an actual verification email.',
        },
      ],
    },
    {
      heading: 'Worked example: capturing groups',
      blocks: [
        {
          type: 'paragraph',
          text: 'Parentheses don\'t just group tokens together - they capture the matched text so it can be extracted or reused.',
        },
        {
          type: 'code',
          language: 'regex',
          code: '(\\d{3})-(\\d{3})-(\\d{4})',
        },
        {
          type: 'example',
          title: 'Matching "555-867-5309"',
          steps: [
            'The full match is "555-867-5309" - all three groups joined by the literal hyphens in the pattern.',
            'Capturing group 1: "555" (area code)',
            'Capturing group 2: "867" (exchange)',
            'Capturing group 3: "5309" (line number)',
            'These groups can be referenced individually in code (e.g. match[1], match[2], match[3] in JavaScript) without re-parsing the string.',
          ],
        },
      ],
    },
  ],
};

export default guide;
