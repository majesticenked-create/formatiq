import type { RichGuide } from './types';
import jsonFormatter from './json-formatter';
import base64EncoderDecoder from './base64-encoder-decoder';
import uuidGenerator from './uuid-generator';
import hashGenerator from './hash-generator';
import regexTester from './regex-tester';

/**
 * Static, build-time lookup map from tool slug to a hand-authored rich
 * guide. A plain object literal (not filesystem globbing) so this resolves
 * at build time and works under `next export` / static generation - no
 * runtime fs access required.
 *
 * Add a tool here only after writing a full content/guides/<slug>.ts file;
 * every other tool automatically gets the registry-field fallback guide
 * (see components/tools/ToolGuide.tsx).
 */
export const richGuides: Record<string, RichGuide> = {
  'json-formatter': jsonFormatter,
  'base64-encoder-decoder': base64EncoderDecoder,
  'uuid-generator': uuidGenerator,
  'hash-generator': hashGenerator,
  'regex-tester': regexTester,
};

export function getRichGuide(slug: string): RichGuide | undefined {
  return richGuides[slug];
}
