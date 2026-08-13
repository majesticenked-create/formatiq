import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ToolDefinition } from '@/lib/tools/types';
import { getCategory, getRelatedTools } from '@/lib/tools/registry';
import AdSlot from './AdSlot';
import RelatedTools from './RelatedTools';
import FaqAccordion from './FaqAccordion';
import CopyLinkButton from './CopyLinkButton';
import ToolCta from './ToolCta';

export default function ToolLayout({ tool, children }: { tool: ToolDefinition; children: ReactNode }) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool);

  const baseUrl = 'https://formatiq.tools';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.title,
        description: tool.metaDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any (runs in browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Formatiq', item: baseUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: category?.title ?? tool.category,
            item: `${baseUrl}/tools/${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.title,
            item: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="tool-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Formatiq</Link> /{' '}
            <Link href={`/tools/${tool.category}`}>{category?.title ?? tool.category}</Link> / {tool.title}
          </div>
          <div className="tool-header-title-row">
            <h1>{tool.title}</h1>
            <CopyLinkButton />
          </div>
          <div className="tool-badges">
            <span className="pill">Client-side</span>
            <span className="pill">No sign-up</span>
            <span className="pill">Free</span>
          </div>
          <p>{tool.shortDescription}</p>
        </div>
      </div>

      {tool.howItWorks && tool.howItWorks.length > 0 && (
        <div className="container how-it-works">
          <h2 className="section-title">How this tool works</h2>
          <div className="how-it-works-steps">
            {tool.howItWorks.map((step, index) => (
              <div className="how-it-works-step" key={step.title}>
                <div className="how-it-works-badge">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container tool-workbench">
        {tool.useCase && (
          <div className="quick-facts">
            <h2>Quick facts</h2>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>
                  <Link href={`/tools/${tool.category}`}>{category?.title ?? tool.category}</Link>
                </dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>{tool.useCase}</dd>
              </div>
            </dl>
          </div>
        )}

        {children}
        <AdSlot label="In-content" />
      </div>

      <div className="container seo-content">
        <h2>About this tool</h2>
        <p>{tool.longDescription}</p>

        {tool.extendedContent && tool.extendedContent.length > 0 && (
          <>
            {tool.extendedContent.map((section) => (
              <div key={section.heading}>
                <h2 style={{ marginTop: 32 }}>{section.heading}</h2>
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: section.body }} />
              </div>
            ))}
          </>
        )}

        {tool.comparisonTable && (
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
        )}

        {tool.benefits && tool.benefits.length > 0 && (
          <>
            <h2 style={{ marginTop: 32 }}>Why use this tool</h2>
            <div className="benefits-grid">
              {tool.benefits.map((benefit) => (
                <div className="benefit-card" key={benefit.title}>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tool.faqs.length > 0 && (
          <>
            <h2 style={{ marginTop: 32 }}>Frequently asked questions</h2>
            <FaqAccordion faqs={tool.faqs} />
          </>
        )}
      </div>

      <div className="container">
        <RelatedTools tools={related} />
      </div>

      <ToolCta category={tool.category} />
    </>
  );
}
