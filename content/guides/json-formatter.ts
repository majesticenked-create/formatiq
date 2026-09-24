import type { RichGuide } from './types';

const guide: RichGuide = {
  slug: 'json-formatter',
  intro:
    'JSON looks simple until a single missing comma or stray quote breaks a build. This guide covers the syntax rules a formatter enforces, the errors it catches, and how to read the output.',
  sections: [
    {
      heading: 'What "formatting" JSON actually does',
      blocks: [
        {
          type: 'paragraph',
          text: 'Formatting takes JSON text - valid or not visually organized - and re-serializes it with consistent indentation and line breaks, so nested objects and arrays are easy to scan. It does not change the data: the same keys, values, and structure go in and come back out, only the whitespace around them changes. A separate step, validation, checks whether the text is syntactically legal JSON in the first place; a formatter that also validates will refuse to reformat text that fails that check and instead reports where it broke.',
        },
        {
          type: 'heading',
          text: 'The rules JSON syntax enforces',
        },
        {
          type: 'list',
          items: [
            'Object keys must be double-quoted strings - single quotes and unquoted keys are invalid JSON, even though both are legal in JavaScript object literals.',
            'Trailing commas are not allowed after the last item in an array or the last property in an object.',
            'Strings must use double quotes; escape a literal double quote inside a string as \\".',
            'Numbers cannot have leading zeros (01 is invalid) and cannot be NaN, Infinity, or written as hex.',
            'Every opening brace, bracket, and quote needs a matching close - the most common real-world failure is one of these left unclosed after editing by hand.',
          ],
        },
      ],
    },
    {
      heading: 'Before and after: a typical minified API response',
      blocks: [
        {
          type: 'paragraph',
          text: 'APIs commonly return JSON with no whitespace at all, which is efficient to transmit but unreadable to a person debugging a response. Formatting with 2-space indentation turns this:',
        },
        {
          type: 'code',
          language: 'json',
          code: '{"id":1,"name":"Ada Lovelace","roles":["admin","editor"],"active":true}',
        },
        { type: 'paragraph', text: 'into this:' },
        {
          type: 'code',
          language: 'json',
          code:
            '{\n  "id": 1,\n  "name": "Ada Lovelace",\n  "roles": [\n    "admin",\n    "editor"\n  ],\n  "active": true\n}',
        },
        {
          type: 'note',
          text: 'The reverse operation - minifying - strips exactly this whitespace back out. It is useful when you want the smallest possible payload (e.g. embedding config JSON in a URL or a build artifact) rather than something readable.',
        },
      ],
    },
    {
      heading: 'Common errors and what they mean',
      blocks: [
        {
          type: 'table',
          headers: ['Error message pattern', 'Typical cause', 'Fix'],
          rows: [
            [
              'Unexpected token } / Unexpected end of JSON input',
              'A trailing comma before a closing brace or bracket, or a value cut off mid-edit',
              'Remove the trailing comma, or complete the truncated value',
            ],
            [
              "Unexpected token '",
              "Single-quoted string or key (valid in JS, not in JSON)",
              'Replace single quotes with double quotes',
            ],
            [
              'Unexpected non-whitespace character after JSON',
              'Two JSON values concatenated (e.g. two objects pasted back to back) instead of one root value',
              'Wrap them in an array, or format them one at a time',
            ],
            [
              'Bad control character in string literal',
              'A raw newline or tab pasted inside a string instead of the escaped \\n / \\t',
              'Escape the character or remove it',
            ],
          ],
        },
      ],
    },
  ],
};

export default guide;
