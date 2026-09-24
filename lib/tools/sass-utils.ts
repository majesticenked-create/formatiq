import * as sass from 'sass';

export type SassSyntax = 'scss' | 'indented';

export type CompileSassResult = { ok: true; css: string } | { ok: false; message: string };

/**
 * Compiles Sass source (SCSS or the indented "Sass" syntax) to plain CSS using the official
 * Dart Sass package's `compileString`, entirely in-memory. No filename/URL is given, so
 * `@import`/`@use` can never resolve against a real filesystem or network address - an
 * unresolvable import fails with a clear compile error instead of attempting to fetch anything.
 * Shared by both the SASS Compiler and SCSS Compiler tools so the compiler setup and error
 * handling isn't duplicated between them.
 */
export function compileSass(source: string, syntax: SassSyntax): CompileSassResult {
  if (!source.trim()) {
    return { ok: false, message: `Paste some ${syntax === 'scss' ? 'SCSS' : 'Sass'} to compile.` };
  }

  try {
    const result = sass.compileString(source, { syntax, style: 'expanded' });
    return { ok: true, css: result.css };
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message).split('\n')[0]
        : `Could not compile this ${syntax === 'scss' ? 'SCSS' : 'Sass'}.`;
    return { ok: false, message };
  }
}
