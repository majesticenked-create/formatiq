import type { ReactNode } from 'react';
import type { ToolDefinition } from '@/lib/tools/types';
import { getRichGuide } from '@/content/guides';
import { makeUniqueAnchorIds } from '@/lib/tools/guide-utils';
import GuideBlockRenderer from './GuideBlocks';
import FaqAccordion from '../FaqAccordion';

interface GuideSectionData {
  heading: string;
  content: ReactNode;
}

/**
 * Long-form educational guide for a tool page. Renders one of two ways:
 *
 *  - If content/guides/<slug>.ts exports a rich, hand-authored guide, render
 *    its block-based sections (formulas, worked examples, tables, code).
 *  - Otherwise, fall back to a guide built entirely from existing registry
 *    fields (longDescription, useCase, howItWorks, extendedContent,
 *    comparisonTable, benefits, faqs) - every tool gets a structured,
 *    TOC-navigable article immediately, with zero new content-writing.
 *
 * Server component: static output only, no client JS. The one small
 * "interactive" affordance (collapsing the table of contents) uses a plain
 * <details>/<summary> element, which needs no JavaScript at all.
 */
export default function ToolGuide({ tool }: { tool: ToolDefinition }) {
  const rich = getRichGuide(tool.slug);
  const sections: GuideSectionData[] = rich ? buildRichSections(rich, tool) : buildFallbackSections(tool);

  // Filter out any section that would render with no content beneath its
  // heading (defensive - both builders should already avoid this).
  const nonEmptySections = sections.filter((s) => s.content !== null && s.content !== undefined);

  if (nonEmptySections.length === 0) return null;

  const ids = makeUniqueAnchorIds(nonEmptySections.map((s) => s.heading));

  return (
    <div className="container tool-guide">
      <article className="guide-article">
        {rich?.intro && <p className="guide-intro">{rich.intro}</p>}

        <details className="guide-toc" open>
          <summary>On this page</summary>
          <ul>
            {nonEmptySections.map((section, i) => (
              <li key={ids[i]}>
                <a href={`#${ids[i]}`}>{section.heading}</a>
              </li>
            ))}
          </ul>
        </details>

        {nonEmptySections.map((section, i) => (
          <section key={ids[i]} id={ids[i]} className="guide-section">
            <h2>{section.heading}</h2>
            {section.content}
          </section>
        ))}
      </article>
    </div>
  );
}

function buildRichSections(rich: NonNullable<ReturnType<typeof getRichGuide>>, tool: ToolDefinition): GuideSectionData[] {
  const sections: GuideSectionData[] = rich.sections.map((section, sIdx) => ({
    heading: section.heading,
    content: (
      <>
        {section.blocks.map((block, bIdx) => (
          <GuideBlockRenderer key={`${sIdx}-${bIdx}`} block={block} keyPrefix={`${sIdx}-${bIdx}`} />
        ))}
      </>
    ),
  }));

  if (tool.faqs.length > 0) {
    sections.push({
      heading: 'Frequently asked questions',
      content: <FaqAccordion faqs={tool.faqs} />,
    });
  }

  return sections;
}

function buildFallbackSections(tool: ToolDefinition): GuideSectionData[] {
  const sections: GuideSectionData[] = [];

  // Overview: longDescription + useCase woven in.
  sections.push({
    heading: 'Overview',
    content: (
      <>
        <p>{tool.longDescription}</p>
        {tool.useCase && (
          <p>
            <strong>Best for:</strong> {tool.useCase}
          </p>
        )}
      </>
    ),
  });

  // How to use this tool: registry howItWorks steps.
  if (tool.howItWorks && tool.howItWorks.length > 0) {
    sections.push({
      heading: 'How to use this tool',
      content: (
        <ol className="guide-list">
          {tool.howItWorks.map((step) => (
            <li key={step.title}>
              <strong>{step.title}.</strong> {step.description}
            </li>
          ))}
        </ol>
      ),
    });
  }

  // Extended Q&A-framed content sections, each promoted to its own
  // top-level guide section (was previously rendered flat, un-navigable).
  if (tool.extendedContent && tool.extendedContent.length > 0) {
    for (const section of tool.extendedContent) {
      sections.push({
        heading: section.heading,
        // eslint-disable-next-line react/no-danger
        content: <div dangerouslySetInnerHTML={{ __html: section.body }} />,
      });
    }
  }

  // Comparison table, if present.
  if (tool.comparisonTable) {
    sections.push({
      heading: 'Comparison',
      content: (
        <div className="comparison-table-wrap">
          <table>
            <thead>
              <tr>
                {tool.comparisonTable.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tool.comparisonTable.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });
  }

  // Benefits ("Why use this tool") card grid.
  if (tool.benefits && tool.benefits.length > 0) {
    sections.push({
      heading: 'Why use this tool',
      content: (
        <div className="benefits-grid">
          {tool.benefits.map((benefit) => (
            <div className="benefit-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      ),
    });
  }

  // FAQ, last.
  if (tool.faqs.length > 0) {
    sections.push({
      heading: 'Frequently asked questions',
      content: <FaqAccordion faqs={tool.faqs} />,
    });
  }

  return sections;
}
