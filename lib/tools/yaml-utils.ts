import { load } from 'js-yaml';

export type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

export type ParseYamlResult = { ok: true; value: YamlValue } | { ok: false; message: string };

/**
 * Parses YAML using js-yaml's `load()` (the safe loader in js-yaml 4.x - the older, unsafe
 * `safeLoad`/`load` split from js-yaml 3.x was removed, and today's single `load()` never
 * instantiates arbitrary JS classes from YAML tags like `!!js/function`). This never executes
 * YAML content - it only parses it into a plain in-memory value. Shared by yaml-parser (and
 * reusable by any future YAML tool) so the parse/error-handling path isn't duplicated.
 */
export function parseYaml(input: string): ParseYamlResult {
  if (!input.trim()) {
    return { ok: false, message: 'Paste some YAML.' };
  }

  try {
    const value = load(input) as YamlValue;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Invalid YAML' };
  }
}
