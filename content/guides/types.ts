/**
 * Block model for hand-authored, richer tool guides.
 *
 * Kept intentionally small: enough block types to explain a calculator or a
 * developer tool in depth (formulas, worked examples, tables, code) without
 * turning into a general-purpose CMS schema. A tool with no entry in the
 * `content/guides/` map falls back to a guide auto-generated from its
 * registry fields (see components/tools/ToolGuide.tsx).
 */

export interface GuideFormulaBlock {
  type: 'formula';
  /** The formula itself, e.g. "A = P(1 + r/n)^(nt)" */
  formula: string;
  /** Symbol-by-symbol legend, in the order symbols appear in the formula. */
  legend: { symbol: string; meaning: string }[];
}

export interface GuideExampleBlock {
  type: 'example';
  title: string;
  /** Ordered worked-example steps; the final step should state the result. */
  steps: string[];
}

export interface GuideParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface GuideHeadingBlock {
  /** Subsection heading within a guide section - rendered as H3. */
  type: 'heading';
  text: string;
}

export interface GuideListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface GuideNoteBlock {
  type: 'note';
  text: string;
}

export interface GuideTableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface GuideCodeBlock {
  type: 'code';
  language?: string;
  code: string;
}

export type GuideBlock =
  | GuideParagraphBlock
  | GuideHeadingBlock
  | GuideListBlock
  | GuideFormulaBlock
  | GuideExampleBlock
  | GuideNoteBlock
  | GuideTableBlock
  | GuideCodeBlock;

export interface GuideSection {
  /** Rendered as an H2; also becomes a TOC entry. */
  heading: string;
  blocks: GuideBlock[];
}

export interface RichGuide {
  /** Tool slug this guide belongs to - must match a registry tool slug (checked by a test). */
  slug: string;
  /** Optional lead paragraph rendered before the table of contents. */
  intro?: string;
  sections: GuideSection[];
}
